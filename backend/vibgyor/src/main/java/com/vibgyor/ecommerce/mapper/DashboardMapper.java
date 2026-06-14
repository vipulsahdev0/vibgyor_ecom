package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.response.dashboard.AdminCountsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.DashboardSummaryResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.OrderStatsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.SalesStatsResponse;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DashboardMapper {

    public AdminCountsResponse toAdminCountsResponse(
            long userCount,
            long productCount,
            long categoryCount,
            long orderCount
    ) {
        return AdminCountsResponse.builder()
                .userCount(userCount)
                .productCount(productCount)
                .categoryCount(categoryCount)
                .orderCount(orderCount)
                .build();
    }

    public SalesStatsResponse toSalesStatsResponse(
            BigDecimal totalSales,
            BigDecimal averageOrderValue,
            long paidOrderCount,
            long totalPaymentCount,
            long successPayments,
            long failedPayments,
            long pendingPayments
    ) {
        return SalesStatsResponse.builder()
                .totalSales(totalSales)
                .averageOrderValue(averageOrderValue)
                .paidOrderCount(paidOrderCount)
                .totalPaymentCount(totalPaymentCount)
                .successPayments(successPayments)
                .failedPayments(failedPayments)
                .pendingPayments(pendingPayments)
                .build();
    }

    public OrderStatsResponse toOrderStatsResponse(
            long totalOrders,
            long pendingOrders,
            long completedOrders,
            long cancelledOrders
    ) {
        return OrderStatsResponse.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .cancelledOrders(cancelledOrders)
                .build();
    }

    public DashboardSummaryResponse toDashboardSummaryResponse(
            AdminCountsResponse counts,
            SalesStatsResponse salesStats,
            OrderStatsResponse orderStats
    ) {
        return DashboardSummaryResponse.builder()
                .counts(counts)
                .salesStats(salesStats)
                .orderStats(orderStats)
                .build();
    }
}