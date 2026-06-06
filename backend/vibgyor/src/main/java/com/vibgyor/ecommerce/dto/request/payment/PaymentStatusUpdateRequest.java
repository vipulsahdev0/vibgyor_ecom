package com.vibgyor.ecommerce.dto.request.payment;

import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusUpdateRequest {

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private String failureReason;   // populated when status is FAILED

    private LocalDateTime paymentDate; // populated when status is SUCCESS
}