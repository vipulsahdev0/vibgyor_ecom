package com.vibgyor.ecommerce.dto.response.payment;

import com.vibgyor.ecommerce.entity.enums.PaymentMethod;
import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSummaryResponse {

    private Long id;
    private Long orderId;
    private String orderNumber;

    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;

    private LocalDateTime paymentDate;
}