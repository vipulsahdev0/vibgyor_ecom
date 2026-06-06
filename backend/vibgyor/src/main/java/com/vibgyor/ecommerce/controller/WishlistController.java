package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.request.wishlist.AddToWishlistRequest;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistResponse;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistSummaryResponse;
import com.vibgyor.ecommerce.service.WishlistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<WishlistResponse> getWishlistByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getWishlistByUserId(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<WishlistResponse> addToWishlist(
            @PathVariable Long userId,
            @Valid @RequestBody AddToWishlistRequest request
    ) {
        return ResponseEntity.ok(wishlistService.addToWishlist(userId, request));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<WishlistResponse> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(wishlistService.removeFromWishlist(userId, productId));
    }

    @DeleteMapping
    public ResponseEntity<WishlistSummaryResponse> clearWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.clearWishlist(userId));
    }

    @GetMapping("/items/{productId}/exists")
    public ResponseEntity<Boolean> isProductInWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(wishlistService.isProductInWishlist(userId, productId));
    }
}