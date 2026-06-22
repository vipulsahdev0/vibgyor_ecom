package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.payment.*;
import com.vibgyor.ecommerce.dto.response.payment.PaymentResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentStatusResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentSummaryResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentService {

    // ─── Legacy / admin style (no ownership check) ────────────────────────────
    PaymentResponse recordPayment(PaymentRequest request);

    PaymentResponse getPaymentById(Long paymentId);

    PaymentResponse getPaymentByOrderId(Long orderId);

    PaymentResponse getPaymentByTransactionId(String transactionId);

    PaymentStatusResponse updatePaymentStatus(Long paymentId, PaymentStatusUpdateRequest request);

    List<PaymentSummaryResponse> getAllPayments();

    List<PaymentSummaryResponse> getPaymentsByStatusAndDateRange(
            String paymentStatus,
            LocalDateTime start,
            LocalDateTime end
    );

    // ─── Secured overloads (user must own the order/payment) ──────────────────
    PaymentResponse recordPayment(PaymentRequest request, Long callerUserId);

    PaymentResponse getPaymentById(Long paymentId, Long callerUserId);

    PaymentResponse getPaymentByOrderId(Long orderId, Long callerUserId);

    // ─── Two-step checkout lifecycle ──────────────────────────────────────────

    // Step 1: create PENDING payment
    PaymentResponse createPayment(CreatePaymentRequest request);

    PaymentResponse createPayment(CreatePaymentRequest request, Long callerUserId);

    // Step 2: verify provider response and finalize state
    PaymentResponse verifyAndUpdatePayment(VerifyPaymentRequest request);

    PaymentResponse verifyAndUpdatePayment(VerifyPaymentRequest request, Long callerUserId);
}