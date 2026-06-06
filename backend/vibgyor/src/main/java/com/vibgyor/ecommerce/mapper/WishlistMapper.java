package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.response.wishlist.WishlistItemResponse;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistResponse;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistSummaryResponse;
import com.vibgyor.ecommerce.entity.Wishlist;
import com.vibgyor.ecommerce.entity.WishlistItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class WishlistMapper {

    public WishlistItemResponse toWishlistItemResponse(WishlistItem item) {
        if (item == null) return null;

        String productImageUrl = null;
        if (item.getProduct() != null && item.getProduct().getImages() != null) {
            productImageUrl = item.getProduct().getImages().stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .map(img -> img.getImageUrl())
                    .findFirst()
                    .orElse(item.getProduct().getImages().stream()
                            .findFirst()
                            .map(img -> img.getImageUrl())
                            .orElse(null));
        }

        return WishlistItemResponse.builder()
                .wishlistItemId(item.getId())
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProduct() != null ? item.getProduct().getName() : null)
                .productImageUrl(productImageUrl)
                .price(item.getProduct() != null ? item.getProduct().getPrice() : null)
                .discountedPrice(item.getProduct() != null ? item.getProduct().getDiscountedPrice() : null)
                .addedAt(item.getAddedAt())
                .build();
    }

    public WishlistResponse toWishlistResponse(Wishlist wishlist) {
        if (wishlist == null) return null;

        List<WishlistItemResponse> itemResponses = wishlist.getWishlistItems() != null
                ? wishlist.getWishlistItems().stream()
                .map(this::toWishlistItemResponse)
                .collect(Collectors.toList())
                : List.of();

        return WishlistResponse.builder()
                .wishlistId(wishlist.getId())
                .userId(wishlist.getUser() != null ? wishlist.getUser().getId() : null)
                .items(itemResponses)
                .totalItems(itemResponses.size())
                .updatedAt(wishlist.getUpdatedAt())
                .build();
    }

    public WishlistSummaryResponse toWishlistSummaryResponse(Wishlist wishlist) {
        if (wishlist == null) return null;

        int totalItems = wishlist.getWishlistItems() != null
                ? wishlist.getWishlistItems().size()
                : 0;

        return WishlistSummaryResponse.builder()
                .wishlistId(wishlist.getId())
                .userId(wishlist.getUser() != null ? wishlist.getUser().getId() : null)
                .totalItems(totalItems)
                .updatedAt(wishlist.getUpdatedAt())
                .build();
    }
}