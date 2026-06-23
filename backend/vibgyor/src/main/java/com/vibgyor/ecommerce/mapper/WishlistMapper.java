package com.vibgyor.ecommerce.mapper;
import com.vibgyor.ecommerce.util.ProductImageUtil;


import com.vibgyor.ecommerce.dto.response.wishlist.WishlistItemResponse;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistResponse;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistSummaryResponse;
import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.Wishlist;
import com.vibgyor.ecommerce.entity.WishlistItem;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class WishlistMapper {


    public WishlistItemResponse toWishlistItemResponse(WishlistItem item) {
        if (item == null) return null;
        Product product = item.getProduct();
        return WishlistItemResponse.builder()
                .wishlistItemId(item.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .productImageUrl(ProductImageUtil.extractPrimaryImageUrl(product))
                .price(product != null ? product.getPrice() : null)
                .discountedPrice(product != null ? product.getDiscountedPrice() : null)
                .addedAt(item.getAddedAt())
                .build();
    }

    public WishlistResponse toWishlistResponse(Wishlist wishlist) {

        if (wishlist == null) {
            return null;
        }

        List<WishlistItemResponse> items =
                wishlist.getWishlistItems() == null
                        ? Collections.emptyList()
                        : wishlist.getWishlistItems()
                        .stream()
                        .map(this::toWishlistItemResponse)
                        .toList();

        return WishlistResponse.builder()
                .wishlistId(wishlist.getId())
                .userId(
                        wishlist.getUser() != null
                                ? wishlist.getUser().getId()
                                : null
                )
                .items(items)
                .totalItems(items.size())
                .updatedAt(wishlist.getUpdatedAt())
                .build();
    }

    public WishlistSummaryResponse toWishlistSummaryResponse(
            Wishlist wishlist
    ) {

        if (wishlist == null) {
            return null;
        }

        return WishlistSummaryResponse.builder()
                .wishlistId(wishlist.getId())
                .userId(
                        wishlist.getUser() != null
                                ? wishlist.getUser().getId()
                                : null
                )
                .totalItems(
                        wishlist.getWishlistItems() != null
                                ? wishlist.getWishlistItems().size()
                                : 0
                )
                .updatedAt(wishlist.getUpdatedAt())
                .build();
    }
}