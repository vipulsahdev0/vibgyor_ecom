package com.vibgyor.ecommerce.dto.response.product;

import com.vibgyor.ecommerce.entity.enums.Status;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private BigDecimal finalPrice;
    private String sku;
    private Integer stockQuantity;
    private Status status;
    private Long categoryId;
    private String categoryName;
    private List<ProductImageResponse> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}