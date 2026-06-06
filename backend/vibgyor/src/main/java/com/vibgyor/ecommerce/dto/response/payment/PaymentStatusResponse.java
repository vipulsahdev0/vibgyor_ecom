package com.vibgyor.ecommerce.dto.response.payment;

import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentStatusResponse {

    private Long paymentId;
    private Long orderId;
    private String orderNumber;
    private PaymentStatus paymentStatus;
    private String message;
}