package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.common.ApiResponse;
import com.vibgyor.ecommerce.dto.response.checkout.CheckoutSummaryResponse;
import com.vibgyor.ecommerce.security.SecurityOwnershipValidator;
import com.vibgyor.ecommerce.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;
    private final SecurityOwnershipValidator ownershipValidator;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CheckoutSummaryResponse>> getCheckoutSummary(
            @PathVariable Long userId) {

        ownershipValidator.validateOwnerOrAdmin(userId);
        CheckoutSummaryResponse summary = checkoutService.getCheckoutSummary(userId);
        return ResponseEntity.ok(
                ApiResponse.ok("Checkout summary fetched successfully", summary)
        );
    }
}