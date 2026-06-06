package com.vibgyor.ecommerce.dto.response.wishlist;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponse {

    private Long wishlistItemId;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private LocalDateTime addedAt;
}