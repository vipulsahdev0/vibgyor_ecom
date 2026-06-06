package com.vibgyor.ecommerce.dto.response.category;

import com.vibgyor.ecommerce.entity.enums.Status;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Status status;
    private Long productCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}