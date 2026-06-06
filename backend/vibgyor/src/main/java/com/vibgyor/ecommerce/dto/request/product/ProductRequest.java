package com.vibgyor.ecommerce.dto.request.product;

import com.vibgyor.ecommerce.entity.enums.Status;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;

    @Size(max = 3000, message = "Description must not exceed 3000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Invalid price format")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true, message = "Discounted price cannot be negative")
    @Digits(integer = 10, fraction = 2, message = "Invalid discounted price format")
    private BigDecimal discountedPrice;

    @Size(max = 100, message = "SKU must not exceed 100 characters")
    private String sku;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity;

    @NotNull(message = "Status is required")
    private Status status;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @Valid
    private List<ProductImageRequest> images;
}