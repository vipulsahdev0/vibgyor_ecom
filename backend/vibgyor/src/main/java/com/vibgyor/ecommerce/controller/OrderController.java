package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.common.ApiResponse;
import com.vibgyor.ecommerce.dto.request.order.OrderStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.request.order.PlaceOrderRequest;
import com.vibgyor.ecommerce.dto.response.order.OrderResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderStatusResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderSummaryResponse;
import com.vibgyor.ecommerce.security.SecurityOwnershipValidator;
import com.vibgyor.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final SecurityOwnershipValidator ownershipValidator;

    @PostMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @PathVariable Long userId,
            @Valid @RequestBody PlaceOrderRequest request) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Order placed successfully",
                        orderService.placeOrder(userId, request)));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<List<OrderSummaryResponse>>> getOrdersByUser(
            @PathVariable Long userId) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Orders fetched successfully",
                orderService.getOrdersByUser(userId)));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.ok("Order fetched successfully",
                orderService.getOrderById(orderId)));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByOrderNumber(
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(ApiResponse.ok("Order fetched successfully",
                orderService.getOrderByOrderNumber(orderNumber)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderSummaryResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok("All orders fetched successfully",
                orderService.getAllOrders()));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderStatusResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Order status updated successfully",
                orderService.updateOrderStatus(orderId, request)));
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderStatusResponse>> cancelOrder(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.ok("Order cancelled successfully",
                orderService.cancelOrder(orderId)));
    }
}