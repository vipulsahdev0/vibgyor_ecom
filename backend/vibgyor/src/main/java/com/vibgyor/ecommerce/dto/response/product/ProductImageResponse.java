package com.vibgyor.ecommerce.dto.response.product;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductImageResponse {

    private Long id;
    private String imageUrl;
    private Boolean isPrimary;
    private Integer displayOrder;
}