package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.common.ApiResponse;
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
    public ResponseEntity<ApiResponse<WishlistResponse>> getWishlistByUserId(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Wishlist fetched successfully",
                wishlistService.getWishlistByUserId(userId)));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            @PathVariable Long userId,
            @Valid @RequestBody AddToWishlistRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Product added to wishlist",
                wishlistService.addToWishlist(userId, request)));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> removeFromWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok("Product removed from wishlist",
                wishlistService.removeFromWishlist(userId, productId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<WishlistSummaryResponse>> clearWishlist(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Wishlist cleared successfully",
                wishlistService.clearWishlist(userId)));
    }

    @GetMapping("/items/{productId}/exists")
    public ResponseEntity<ApiResponse<Boolean>> isProductInWishlist(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok("Check completed",
                wishlistService.isProductInWishlist(userId, productId)));
    }
}