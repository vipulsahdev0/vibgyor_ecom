package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.response.order.OrderItemResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderStatusResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderSummaryResponse;
import com.vibgyor.ecommerce.entity.Order;
import com.vibgyor.ecommerce.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OrderMapper {

    public OrderItemResponse toOrderItemResponse(OrderItem orderItem) {
        if (orderItem == null) return null;

        String productName = orderItem.getProduct() != null ? orderItem.getProduct().getName() : null;

        // Fetch primary image URL from the product's image set
        String productImageUrl = null;
        if (orderItem.getProduct() != null && orderItem.getProduct().getImages() != null) {
            productImageUrl = orderItem.getProduct().getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(img -> img.getImageUrl())
                    .findFirst()
                    .orElse(orderItem.getProduct().getImages().stream()
                            .findFirst()
                            .map(img -> img.getImageUrl())
                            .orElse(null));
        }

        BigDecimal lineTotal = orderItem.getPrice()
                .multiply(BigDecimal.valueOf(orderItem.getQuantity()));

        return OrderItemResponse.builder()
                .orderItemId(orderItem.getId())
                .productId(orderItem.getProduct() != null ? orderItem.getProduct().getId() : null)
                .productName(productName)
                .productImageUrl(productImageUrl)
                .quantity(orderItem.getQuantity())
                .price(orderItem.getPrice())
                .lineTotal(lineTotal)
                .build();
    }

    public OrderResponse toOrderResponse(Order order) {
        if (order == null) return null;

        List<OrderItemResponse> itemResponses = order.getOrderItems() != null
                ? order.getOrderItems().stream()
                .map(this::toOrderItemResponse)
                .collect(Collectors.toList())
                : List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .shippingAddressSnapshot(order.getShippingAddressSnapshot())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    public OrderSummaryResponse toOrderSummaryResponse(Order order) {
        if (order == null) return null;

        int itemCount = order.getOrderItems() != null ? order.getOrderItems().size() : 0;

        return OrderSummaryResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .itemCount(itemCount)
                .createdAt(order.getCreatedAt())
                .build();
    }

    public OrderStatusResponse toOrderStatusResponse(Order order, String message) {
        if (order == null) return null;

        return OrderStatusResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .orderStatus(order.getOrderStatus())
                .paymentStatus(order.getPaymentStatus())
                .message(message)
                .build();
    }

    public List<OrderResponse> toOrderResponseList(List<Order> orders) {
        if (orders == null) return List.of();
        return orders.stream().map(this::toOrderResponse).collect(Collectors.toList());
    }

    public List<OrderSummaryResponse> toOrderSummaryResponseList(List<Order> orders) {
        if (orders == null) return List.of();
        return orders.stream().map(this::toOrderSummaryResponse).collect(Collectors.toList());
    }
}