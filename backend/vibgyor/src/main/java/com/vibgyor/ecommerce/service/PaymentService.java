package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.payment.CreatePaymentRequest;
import com.vibgyor.ecommerce.dto.request.payment.PaymentStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.request.payment.VerifyPaymentRequest;
import com.vibgyor.ecommerce.dto.response.payment.PaymentResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentStatusResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentSummaryResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface PaymentService {

    PaymentResponse recordPayment(CreatePaymentRequest request, Long callerUserId);

    PaymentResponse createPayment(CreatePaymentRequest request, Long callerUserId);

    PaymentResponse verifyAndUpdatePayment(VerifyPaymentRequest request, Long callerUserId);

    PaymentResponse getPaymentById(Long paymentId, Long callerUserId);

    PaymentResponse getPaymentByOrderId(Long orderId, Long callerUserId);

    PaymentResponse getPaymentByTransactionId(String transactionId);

    PaymentStatusResponse updatePaymentStatus(Long paymentId, PaymentStatusUpdateRequest request);

    List<PaymentSummaryResponse> getAllPayments();

    List<PaymentSummaryResponse> getPaymentsByStatusAndDateRange(
            String paymentStatus,
            LocalDateTime start,
            LocalDateTime end
    );
}