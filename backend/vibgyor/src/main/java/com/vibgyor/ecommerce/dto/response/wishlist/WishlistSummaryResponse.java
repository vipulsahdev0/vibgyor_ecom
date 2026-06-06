package com.vibgyor.ecommerce.dto.response.wishlist;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistSummaryResponse {

    private Long wishlistId;
    private Long userId;
    private int totalItems;
    private LocalDateTime updatedAt;
}