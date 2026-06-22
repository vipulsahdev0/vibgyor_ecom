// PaymentMapper
package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.response.payment.PaymentResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentStatusResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentSummaryResponse;
import com.vibgyor.ecommerce.entity.Payment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PaymentMapper {

    public PaymentResponse toPaymentResponse(Payment payment) {
        if (payment == null) return null;

        Long orderId = payment.getOrder() != null ? payment.getOrder().getId() : null;
        String orderNumber = payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null;

        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(orderId)
                .orderNumber(orderNumber)
                .paymentReference(payment.getPaymentReference())
                .transactionId(payment.getTransactionId())
                .providerResponse(payment.getProviderResponse())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    public PaymentSummaryResponse toPaymentSummaryResponse(Payment payment) {
        if (payment == null) return null;

        return PaymentSummaryResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .orderNumber(payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .build();
    }

    public PaymentStatusResponse toPaymentStatusResponse(Payment payment, String message) {
        if (payment == null) return null;

        return PaymentStatusResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrder() != null ? payment.getOrder().getId() : null)
                .orderNumber(payment.getOrder() != null ? payment.getOrder().getOrderNumber() : null)
                .paymentStatus(payment.getPaymentStatus())
                .message(message)
                .build();
    }

    public List<PaymentResponse> toPaymentResponseList(List<Payment> payments) {
        if (payments == null) return List.of();
        return payments.stream().map(this::toPaymentResponse).collect(Collectors.toList());
    }

    public List<PaymentSummaryResponse> toPaymentSummaryResponseList(List<Payment> payments) {
        if (payments == null) return List.of();
        return payments.stream().map(this::toPaymentSummaryResponse).collect(Collectors.toList());
    }
}