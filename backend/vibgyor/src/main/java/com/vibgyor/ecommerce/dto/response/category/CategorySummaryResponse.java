package com.vibgyor.ecommerce.dto.response.category;

import com.vibgyor.ecommerce.entity.enums.Status;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategorySummaryResponse {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Status status;
    private Long productCount;
}