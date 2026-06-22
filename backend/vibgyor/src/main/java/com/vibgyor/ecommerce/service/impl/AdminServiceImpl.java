package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.admin.AdminOrderStatusRequest;
import com.vibgyor.ecommerce.dto.request.admin.AdminPaymentStatusRequest;
import com.vibgyor.ecommerce.dto.response.dashboard.AdminCountsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.DashboardSummaryResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.OrderStatsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.SalesStatsResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderResponse;
import com.vibgyor.ecommerce.dto.response.user.UserResponse;
import com.vibgyor.ecommerce.dto.response.user.UserSummaryResponse;
import com.vibgyor.ecommerce.entity.*;
import com.vibgyor.ecommerce.entity.enums.OrderStatus;
import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.entity.enums.UserRole;
import com.vibgyor.ecommerce.exception.ResourceNotFoundException;
import com.vibgyor.ecommerce.mapper.DashboardMapper;
import com.vibgyor.ecommerce.mapper.OrderMapper;
import com.vibgyor.ecommerce.mapper.UserMapper;
import com.vibgyor.ecommerce.repository.CategoryRepo;
import com.vibgyor.ecommerce.repository.OrderRepo;
import com.vibgyor.ecommerce.repository.PaymentRepo;
import com.vibgyor.ecommerce.repository.ProductRepo;
import com.vibgyor.ecommerce.repository.UserRepo;
import com.vibgyor.ecommerce.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepo userRepo;
    private final ProductRepo productRepo;
    private final CategoryRepo categoryRepo;
    private final OrderRepo orderRepo;
    private final PaymentRepo paymentRepo;
    private final ProductRepo productRepository;
    private final DashboardMapper dashboardMapper;
    private final UserMapper userMapper;
    private final OrderMapper orderMapper;

    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        AdminCountsResponse counts = getAdminCounts();
        SalesStatsResponse salesStats = getSalesStats();
        OrderStatsResponse orderStats = getOrderStats();

        return dashboardMapper.toDashboardSummaryResponse(counts, salesStats, orderStats);
    }

    @Override
    public AdminCountsResponse getAdminCounts() {
        long userCount = userRepo.count();
        long productCount = productRepo.count();
        long categoryCount = categoryRepo.count();
        long orderCount = orderRepo.count();

        return dashboardMapper.toAdminCountsResponse(
                userCount,
                productCount,
                categoryCount,
                orderCount
        );
    }

    @Override
    public SalesStatsResponse getSalesStats() {

        List<Order> allOrders = orderRepo.findAll();
        List<Payment> allPayments = paymentRepo.findAll();

        List<Order> paidOrders = allOrders.stream()
                .filter(order -> order.getPaymentStatus() == PaymentStatus.SUCCESS)
                .toList();

        BigDecimal totalSales = paidOrders.stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = paidOrders.isEmpty()
                ? BigDecimal.ZERO
                : totalSales.divide(
                BigDecimal.valueOf(paidOrders.size()),
                2,
                RoundingMode.HALF_UP
        );

        long successPayments = allPayments.stream()
                .filter(payment -> payment.getPaymentStatus() == PaymentStatus.SUCCESS)
                .count();

        long failedPayments = allPayments.stream()
                .filter(payment -> payment.getPaymentStatus() == PaymentStatus.FAILED)
                .count();

        long pendingPayments = allPayments.stream()
                .filter(payment -> payment.getPaymentStatus() == PaymentStatus.PENDING)
                .count();

        return dashboardMapper.toSalesStatsResponse(
                totalSales,
                averageOrderValue,
                paidOrders.size(),
                allPayments.size(),
                successPayments,
                failedPayments,
                pendingPayments
        );
    }

    @Override
    public OrderStatsResponse getOrderStats() {
        long totalOrders = orderRepo.count();

        long pendingOrders = orderRepo.findByOrderStatus(OrderStatus.PENDING_PAYMENT).size();

        long completedOrders = 0;
        try {
            completedOrders = orderRepo.findByOrderStatus(OrderStatus.DELIVERED).size();
        } catch (Exception ignored) {
            // In case DELIVERED is not available in enum yet
        }

        long cancelledOrders = 0;
        try {
            cancelledOrders = orderRepo.findByOrderStatus(OrderStatus.CANCELLED).size();
        } catch (Exception ignored) {
            // In case CANCELLED is not available in enum yet
        }


        return dashboardMapper.toOrderStatsResponse(
                totalOrders,
                pendingOrders,
                completedOrders,
                cancelledOrders
        );
    }

    // ── User Management ───────────────────────────────────────────────────

    @Override
    public List<UserSummaryResponse> getUsers(UserRole role, Status status) {
        if (role != null) return userMapper.toUserSummaryResponseList(userRepo.findByRole(role));
        if (status != null) return userMapper.toUserSummaryResponseList(userRepo.findByStatus(status));
        return userMapper.toUserSummaryResponseList(userRepo.findAll());
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long userId, Status status) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setStatus(status);
        return userMapper.toUserResponse(userRepo.save(user));
    }

    @Override
    @Transactional
    public void softDeleteUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setStatus(Status.DELETED);
        userRepo.save(user);
    }

    // ── Order Management ──────────────────────────────────────────────────

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepo.findAll().stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, AdminOrderStatusRequest request) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        OrderStatus newStatus = request.getOrderStatus();
        OrderStatus currentStatus = order.getOrderStatus();

        // If cancelling a CONFIRMED order → restore stock
        if (newStatus == OrderStatus.CANCELLED
                && (currentStatus == OrderStatus.CONFIRMED
                || currentStatus == OrderStatus.PROCESSING
                || currentStatus == OrderStatus.SHIPPED)) {
            restoreStock(order);
        }

        order.setOrderStatus(newStatus);
        return orderMapper.toOrderResponse(orderRepo.save(order));
    }

    @Override
    @Transactional
    public OrderResponse updatePaymentStatusByAdmin(Long orderId, AdminPaymentStatusRequest request) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        order.setPaymentStatus(request.getPaymentStatus());

        // Sync payment entity if it exists
        paymentRepo.findByOrderId(orderId).ifPresent(payment -> {
            payment.setPaymentStatus(request.getPaymentStatus());
            if (request.getReason() != null) {
                payment.setFailureReason(request.getReason());
            }
            paymentRepo.save(payment);
        });

        return orderMapper.toOrderResponse(orderRepo.save(order));
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private void restoreStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
            }
        }
    }
}