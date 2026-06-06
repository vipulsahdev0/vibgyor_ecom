package com.vibgyor.ecommerce.dto.request.product;

import com.vibgyor.ecommerce.entity.enums.Status;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFilterRequest {

    private Long categoryId;
    private Status status;
    private String keyword;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean inStock;
}