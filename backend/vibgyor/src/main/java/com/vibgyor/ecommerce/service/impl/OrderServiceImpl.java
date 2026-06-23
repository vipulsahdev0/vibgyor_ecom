package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.order.OrderStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.request.order.PlaceOrderRequest;
import com.vibgyor.ecommerce.dto.response.order.OrderResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderStatusResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderSummaryResponse;
import com.vibgyor.ecommerce.entity.*;
import com.vibgyor.ecommerce.entity.enums.OrderStatus;
import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import com.vibgyor.ecommerce.mapper.OrderMapper;
import com.vibgyor.ecommerce.repository.*;
import com.vibgyor.ecommerce.service.OrderService;
import com.vibgyor.ecommerce.util.UserLookupHelper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final CartRepo cartRepo;
    private final UserRepo userRepo;
    private final UserLookupHelper userLookupHelper;
    private final AddressRepo addressRepo;
    private final OrderMapper orderMapper;
    private final ProductRepo productRepo;

    // ─── Place order from cart (PENDING, no stock deduction yet) ──────────────

    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {

        // 1. Load user
        User user = userLookupHelper.findById(userId);

        // 2. Load cart with items
        Cart cart = cartRepo.findByUserIdWithItems(userId)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found for user: " + userId));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cannot place order: cart is empty");
        }

        // 3. Load and validate shipping address ownership
        Address shippingAddress = addressRepo.findById(request.getAddressId())
                .orElseThrow(() ->
                        new RuntimeException("Address not found with id: " + request.getAddressId()));

        if (!shippingAddress.getUser().getId().equals(userId)) {
            throw new RuntimeException("Selected address does not belong to the current user");
        }

        // 4. Validate stock for each cart item (but do NOT reduce yet)
        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();

            if (product.getStockQuantity() == null ||
                    product.getStockQuantity() < cartItem.getQuantity()) {

                throw new RuntimeException(
                        "Insufficient stock for product " + product.getName()
                                + ". Available: " + product.getStockQuantity()
                                + ", Requested: " + cartItem.getQuantity()
                );
            }
        }

        // 5. Build address snapshot
        String addressSnapshot = buildAddressSnapshot(shippingAddress);

        // 6. Create Order (PENDING, no stock deduction yet)
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .shippingAddress(shippingAddress)
                .shippingAddressSnapshot(addressSnapshot)
                .orderStatus(OrderStatus.PENDING_PAYMENT)
                .paymentStatus(PaymentStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .orderItems(new ArrayList<>())
                .build();

        Order savedOrder = orderRepo.save(order);

        // 7. Create OrderItems from CartItems and compute total
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getCartItems()) {
            Product product = cartItem.getProduct();

            // Prefer cart unitPrice (could capture discounted price at time of order)
            BigDecimal unitPrice = cartItem.getUnitPrice() != null
                    ? cartItem.getUnitPrice()
                    : product.getPrice();

            BigDecimal lineTotal = unitPrice.multiply(
                    BigDecimal.valueOf(cartItem.getQuantity()));

            totalAmount = totalAmount.add(lineTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(unitPrice)
                    .build();

            orderItems.add(orderItem);
        }

        // 8. Persist order items and set total amount
        orderItemRepo.saveAll(orderItems);
        savedOrder.setOrderItems(orderItems);
        savedOrder.setTotalAmount(totalAmount);
        orderRepo.save(savedOrder);


        // 9. Return order with items
        Order orderWithItems = orderRepo.findByIdWithItems(savedOrder.getId())
                .orElse(savedOrder);

        return orderMapper.toOrderResponse(orderWithItems);
    }

    // ─── Get orders for a user ────────────────────────────────────────────────

    @Override
    public List<OrderSummaryResponse> getOrdersByUser(Long userId) {
        List<Order> orders = orderRepo.findByUserIdOrderByCreatedAtDesc(userId);
        return orderMapper.toOrderSummaryResponseList(orders);
    }

    // ─── Get order by ID ──────────────────────────────────────────────────────

    @Override
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepo.findByIdWithItems(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found with id: " + orderId));
        return orderMapper.toOrderResponse(order);
    }

    // ─── Get order by order number ────────────────────────────────────────────

    @Override
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() ->
                        new RuntimeException("Order not found with number: " + orderNumber));
        return orderMapper.toOrderResponse(order);
    }

    // ─── Admin: get all orders ────────────────────────────────────────────────

    @Override
    public List<OrderSummaryResponse> getAllOrders() {
        List<Order> orders = orderRepo.findAll();
        return orderMapper.toOrderSummaryResponseList(orders);
    }

    // ─── Admin: update order status/payment status ────────────────────────────

    @Override
    @Transactional
    public OrderStatusResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found with id: " + orderId));

        order.setOrderStatus(request.getOrderStatus());

        if (request.getPaymentStatus() != null) {
            order.setPaymentStatus(request.getPaymentStatus());
        }

        orderRepo.save(order);

        return orderMapper.toOrderStatusResponse(
                order,
                "Order status updated successfully"
        );
    }

    // ─── Admin: cancel order and restore stock ────────────────────────────────

    @Override
    @Transactional
    public OrderStatusResponse cancelOrder(Long orderId) {

        Order order = orderRepo.findByIdWithItems(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Order not found with id: " + orderId));

        if (order.getOrderStatus() == OrderStatus.SHIPPED ||
                order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException(
                    "Shipped or delivered orders cannot be cancelled"
            );
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }

        List<Product> productsToRestore = new ArrayList<>();

        // Restore stock
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(
                    product.getStockQuantity() + item.getQuantity()
            );
            productsToRestore.add(product);
        }

        productRepo.saveAll(productsToRestore);

        order.setOrderStatus(OrderStatus.CANCELLED);

        orderRepo.save(order);

        return orderMapper.toOrderStatusResponse(
                order,
                "Order cancelled successfully"
        );
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String generateOrderNumber() {

        String datePart =
                LocalDateTime.now()
                        .format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        String uniquePart =
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();

        return "ORD-" + datePart + "-" + uniquePart;
    }

    private String buildAddressSnapshot(Address address) {

        return String.format(
                "{\\\"fullName\\\":\\\"%s\\\",\\\"mobile\\\":\\\"%s\\\","
                        + "\\\"addressLine1\\\":\\\"%s\\\","
                        + "\\\"addressLine2\\\":\\\"%s\\\","
                        + "\\\"city\\\":\\\"%s\\\","
                        + "\\\"state\\\":\\\"%s\\\","
                        + "\\\"country\\\":\\\"%s\\\","
                        + "\\\"zipCode\\\":\\\"%s\\\"}",

                address.getFullName(),
                address.getMobile(),
                address.getAddressLine1(),
                address.getAddressLine2() != null
                        ? address.getAddressLine2()
                        : "",
                address.getCity(),
                address.getState(),
                address.getCountry(),
                address.getZipCode()
        );
    }
}