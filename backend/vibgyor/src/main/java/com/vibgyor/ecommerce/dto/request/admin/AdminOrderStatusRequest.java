
package com.vibgyor.ecommerce.dto.request.admin;

import com.vibgyor.ecommerce.entity.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminOrderStatusRequest {

    @NotNull(message = "Order status is required")
    private OrderStatus orderStatus;

    private String note; // optional admin note
}