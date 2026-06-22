package com.vibgyor.ecommerce.dto.request.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyPaymentRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotBlank(message = "Payment reference is required")
    private String paymentReference;

    private boolean success;

    // Optional transaction id from gateway if available
    private String transactionId;

    // Raw payload / message from provider
    private String providerResponse;
}