package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.response.dashboard.AdminCountsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.DashboardSummaryResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.OrderStatsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.SalesStatsResponse;
import com.vibgyor.ecommerce.entity.Order;
import com.vibgyor.ecommerce.entity.Payment;
import com.vibgyor.ecommerce.entity.enums.OrderStatus;
import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.mapper.DashboardMapper;
import com.vibgyor.ecommerce.repository.CategoryRepo;
import com.vibgyor.ecommerce.repository.OrderRepo;
import com.vibgyor.ecommerce.repository.PaymentRepo;
import com.vibgyor.ecommerce.repository.ProductRepo;
import com.vibgyor.ecommerce.repository.UserRepo;
import com.vibgyor.ecommerce.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepo userRepo;
    private final ProductRepo productRepo;
    private final CategoryRepo categoryRepo;
    private final OrderRepo orderRepo;
    private final PaymentRepo paymentRepo;
    private final DashboardMapper dashboardMapper;

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
                .filter(amount -> amount != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageOrderValue = paidOrders.isEmpty()
                ? BigDecimal.ZERO
                : totalSales.divide(
                BigDecimal.valueOf(paidOrders.size()),
                2,
                RoundingMode.HALF_UP
        );

        return dashboardMapper.toSalesStatsResponse(
                totalSales,
                averageOrderValue,
                paidOrders.size(),
                allPayments.size()
        );
    }

    @Override
    public OrderStatsResponse getOrderStats() {
        long totalOrders = orderRepo.count();

        long pendingOrders = orderRepo.findByOrderStatus(OrderStatus.PENDING).size();

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
}