package com.vibgyor.ecommerce.dto.request.category;

import com.vibgyor.ecommerce.entity.enums.Status;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private Status status;
}