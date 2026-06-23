package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.common.ApiResponse;
import com.vibgyor.ecommerce.dto.request.cart.AddToCartRequest;
import com.vibgyor.ecommerce.dto.response.cart.CartResponse;
import com.vibgyor.ecommerce.dto.response.cart.CartSummaryResponse;
import com.vibgyor.ecommerce.security.SecurityOwnershipValidator;
import com.vibgyor.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final SecurityOwnershipValidator ownershipValidator;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCartByUserId(
            @PathVariable Long userId) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Cart fetched successfully",
                cartService.getCartByUserId(userId)));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            @PathVariable Long userId,
            @Valid @RequestBody AddToCartRequest request) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart",
                cartService.addToCart(userId, request)));
    }

    @PutMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long userId,
            @Valid @RequestBody AddToCartRequest request) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Cart item updated",
                cartService.updateCartItem(userId, request)));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart",
                cartService.removeFromCart(userId, productId)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCartSummary(
            @PathVariable Long userId) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Cart summary fetched successfully",
                cartService.getCartSummary(userId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared successfully", null));
    }
}