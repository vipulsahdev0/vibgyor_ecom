package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.payment.PaymentRequest;
import com.vibgyor.ecommerce.dto.request.payment.PaymentStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.response.payment.PaymentResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentStatusResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentSummaryResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentService {

    // Record a new payment against an order
    PaymentResponse recordPayment(PaymentRequest request);

    // Get payment details by payment ID
    PaymentResponse getPaymentById(Long paymentId);

    // Get payment by order ID
    PaymentResponse getPaymentByOrderId(Long orderId);

    // Get payment by transaction ID
    PaymentResponse getPaymentByTransactionId(String transactionId);

    // Admin: update payment status (confirm, fail, refund)
    PaymentStatusResponse updatePaymentStatus(Long paymentId, PaymentStatusUpdateRequest request);

    // Admin: get all payments
    List<PaymentSummaryResponse> getAllPayments();

    // Admin: get payments filtered by status and date range
    List<PaymentSummaryResponse> getPaymentsByStatusAndDateRange(
            String paymentStatus,
            LocalDateTime start,
            LocalDateTime end
    );
}