package com.vibgyor.ecommerce.dto.response.category;

import com.vibgyor.ecommerce.entity.enums.Status;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryStatusResponse {

    private Long id;
    private String name;
    private Status status;
    private String message;
}