package com.vibgyor.ecommerce.dto.response.checkout;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutSummaryResponse {

    private Long userId;
    private Long cartId;
    private List<CheckoutItemResponse> items;

    private BigDecimal subtotal;
    private BigDecimal shipping;
    private BigDecimal tax;
    private BigDecimal grandTotal;

    private Long defaultAddressId;  // for frontend
}