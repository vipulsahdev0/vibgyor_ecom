package com.vibgyor.ecommerce.dto.response.payment;

import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import lombok.*;

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