package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.response.dashboard.AdminCountsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.DashboardSummaryResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.OrderStatsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.SalesStatsResponse;

public interface AdminService {

    // Main admin dashboard summary
    DashboardSummaryResponse getDashboardSummary();

    // Individual dashboard blocks
    AdminCountsResponse getAdminCounts();

    SalesStatsResponse getSalesStats();

    OrderStatsResponse getOrderStats();
}