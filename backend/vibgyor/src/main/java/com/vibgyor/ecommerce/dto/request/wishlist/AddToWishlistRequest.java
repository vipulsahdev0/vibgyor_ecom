package com.vibgyor.ecommerce.dto.request.wishlist;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddToWishlistRequest {

    @NotNull(message = "Product ID is required")
    @Positive
    private Long productId;
}