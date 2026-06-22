package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.common.ApiResponse;
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
import com.vibgyor.ecommerce.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.ok("Dashboard data fetched successfully",
                adminService.getDashboardSummary()));
    }

    @GetMapping("/dashboard/counts")
    public ResponseEntity<ApiResponse<AdminCountsResponse>> getAdminCounts() {
        return ResponseEntity.ok(ApiResponse.ok("Admin counts fetched successfully",
                adminService.getAdminCounts()));
    }

    @GetMapping("/dashboard/sales")
    public ResponseEntity<ApiResponse<SalesStatsResponse>> getSalesStats() {
        return ResponseEntity.ok(ApiResponse.ok("Sales stats fetched successfully",
                adminService.getSalesStats()));
    }

    @GetMapping("/dashboard/orders")
    public ResponseEntity<ApiResponse<OrderStatsResponse>> getOrderStats() {
        return ResponseEntity.ok(ApiResponse.ok("Order stats fetched successfully",
                adminService.getOrderStats()));
    }

    // ── User Management ───────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserSummaryResponse>>> getAllUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) Status status) {
        return ResponseEntity.ok(ApiResponse.ok("Users fetched successfully",
                adminService.getUsers(role, status)));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam Status status) {
        return ResponseEntity.ok(ApiResponse.ok("User status updated",
                adminService.updateUserStatus(userId, status)));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> softDeleteUser(@PathVariable Long userId) {
        adminService.softDeleteUser(userId);
        return ResponseEntity.ok(ApiResponse.ok("User soft-deleted successfully", null));
    }

    // ── Order Management ──────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok("Orders fetched successfully",
                adminService.getAllOrders()));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody AdminOrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Order status updated",
                adminService.updateOrderStatus(orderId, request)));
    }

    @PatchMapping("/orders/{orderId}/payment-status")
    public ResponseEntity<ApiResponse<OrderResponse>> updatePaymentStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody AdminPaymentStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Payment status updated",
                adminService.updatePaymentStatusByAdmin(orderId, request)));
    }
}