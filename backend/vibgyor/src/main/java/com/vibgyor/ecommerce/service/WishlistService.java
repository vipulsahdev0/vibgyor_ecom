package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.wishlist.AddToWishlistRequest;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistResponse;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistSummaryResponse;

public interface WishlistService {

    // Get the full wishlist for a user (creates one if it doesn't exist)
    WishlistResponse getWishlistByUserId(Long userId);

    // Add a product to the user's wishlist
    WishlistResponse addToWishlist(Long userId, AddToWishlistRequest request);

    // Remove a specific product from the wishlist
    WishlistResponse removeFromWishlist(Long userId, Long productId);

    // Clear all items from the wishlist
    WishlistSummaryResponse clearWishlist(Long userId);

    // Check if a specific product is already in the wishlist
    boolean isProductInWishlist(Long userId, Long productId);
}