package com.vibgyor.ecommerce.dto.response.cart;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartSummaryResponse {

    private Long cartId;
    private Integer totalItems;
    private BigDecimal grandTotal;
}