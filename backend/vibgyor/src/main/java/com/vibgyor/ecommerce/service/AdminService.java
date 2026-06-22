package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.admin.AdminOrderStatusRequest;
import com.vibgyor.ecommerce.dto.request.admin.AdminPaymentStatusRequest;
import com.vibgyor.ecommerce.dto.response.dashboard.AdminCountsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.DashboardSummaryResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.OrderStatsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.SalesStatsResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderResponse;
import com.vibgyor.ecommerce.dto.response.user.UserResponse;
import com.vibgyor.ecommerce.dto.response.user.UserSummaryResponse;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.entity.enums.UserRole;

import java.util.List;

public interface AdminService {

    // Main admin dashboard summary
    DashboardSummaryResponse getDashboardSummary();

    // Individual dashboard blocks
    AdminCountsResponse getAdminCounts();

    SalesStatsResponse getSalesStats();

    OrderStatsResponse getOrderStats();

    // User management
    List<UserSummaryResponse> getUsers(UserRole role, Status status);
    UserResponse updateUserStatus(Long userId, Status status);
    void softDeleteUser(Long userId);

    // Order management
    List<OrderResponse> getAllOrders();
    OrderResponse updateOrderStatus(Long orderId, AdminOrderStatusRequest request);
    OrderResponse updatePaymentStatusByAdmin(Long orderId, AdminPaymentStatusRequest request);
}