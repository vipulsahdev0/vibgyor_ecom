package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.response.dashboard.AdminCountsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.DashboardSummaryResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.OrderStatsResponse;
import com.vibgyor.ecommerce.dto.response.dashboard.SalesStatsResponse;
import com.vibgyor.ecommerce.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        return ResponseEntity.ok(adminService.getDashboardSummary());
    }

    @GetMapping("/dashboard/counts")
    public ResponseEntity<AdminCountsResponse> getAdminCounts() {
        return ResponseEntity.ok(adminService.getAdminCounts());
    }

    @GetMapping("/dashboard/sales")
    public ResponseEntity<SalesStatsResponse> getSalesStats() {
        return ResponseEntity.ok(adminService.getSalesStats());
    }

    @GetMapping("/dashboard/orders")
    public ResponseEntity<OrderStatsResponse> getOrderStats() {
        return ResponseEntity.ok(adminService.getOrderStats());
    }
}