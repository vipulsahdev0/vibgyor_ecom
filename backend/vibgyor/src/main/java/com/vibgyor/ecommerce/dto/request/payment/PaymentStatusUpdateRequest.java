package com.vibgyor.ecommerce.dto.request.payment;

import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusUpdateRequest {

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private String failureReason;

    private LocalDateTime paymentDate;
}