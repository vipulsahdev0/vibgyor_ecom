package com.vibgyor.ecommerce.dto.request.admin;

import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminPaymentStatusRequest {

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private String reason;
}