package com.vibgyor.ecommerce.dto.response.wishlist;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistResponse {

    private Long wishlistId;
    private Long userId;
    private List<WishlistItemResponse> items;
    private int totalItems;
    private LocalDateTime updatedAt;
}