package com.vibgyor.ecommerce.dto.response.product;

import com.vibgyor.ecommerce.entity.enums.Status;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSummaryResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private BigDecimal finalPrice;
    private String primaryImageUrl;
    private String categoryName;
    private Integer stockQuantity;
    private Status status;
}