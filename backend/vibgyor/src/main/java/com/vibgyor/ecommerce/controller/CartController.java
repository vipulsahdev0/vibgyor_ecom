package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.request.cart.AddToCartRequest;
import com.vibgyor.ecommerce.dto.request.cart.UpdateCartItemRequest;
import com.vibgyor.ecommerce.dto.response.cart.CartResponse;
import com.vibgyor.ecommerce.dto.response.cart.CartSummaryResponse;
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

    @GetMapping
    public ResponseEntity<CartResponse> getCartByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCartByUserId(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(
            @PathVariable Long userId,
            @Valid @RequestBody AddToCartRequest request
    ) {
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    @PutMapping("/items")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.updateCartItem(userId, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeFromCart(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(cartService.removeFromCart(userId, productId));
    }

    @GetMapping("/summary")
    public ResponseEntity<CartSummaryResponse> getCartSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCartSummary(userId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }
}