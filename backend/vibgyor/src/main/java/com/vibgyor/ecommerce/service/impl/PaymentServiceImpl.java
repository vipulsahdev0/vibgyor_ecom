package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.payment.PaymentRequest;
import com.vibgyor.ecommerce.dto.request.payment.PaymentStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.response.payment.PaymentResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentStatusResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentSummaryResponse;
import com.vibgyor.ecommerce.entity.Order;
import com.vibgyor.ecommerce.entity.Payment;
import com.vibgyor.ecommerce.entity.enums.OrderStatus;
import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import com.vibgyor.ecommerce.mapper.PaymentMapper;
import com.vibgyor.ecommerce.repository.OrderRepo;
import com.vibgyor.ecommerce.repository.PaymentRepo;
import com.vibgyor.ecommerce.service.PaymentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepo paymentRepo;
    private final OrderRepo orderRepo;
    private final PaymentMapper paymentMapper;

    @Override
    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {

        Order order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException(
                        "Order not found with id: " + request.getOrderId()));

        // Prevent duplicate payment records for the same order
        paymentRepo.findByOrderId(request.getOrderId()).ifPresent(existing -> {
            throw new RuntimeException(
                    "A payment record already exists for order id: " + request.getOrderId());
        });

        // Validate that payment amount matches order total
        if (request.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new RuntimeException(
                    "Payment amount (" + request.getAmount() +
                            ") does not match order total (" + order.getTotalAmount() + ")");
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .transactionId(request.getTransactionId())
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepo.save(payment);

        // Sync order's payment status
        order.setPaymentStatus(PaymentStatus.PENDING);
        orderRepo.save(order);

        return paymentMapper.toPaymentResponse(saved);
    }

    @Override
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new RuntimeException(
                        "Payment not found with id: " + paymentId));
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException(
                        "Payment not found for order id: " + orderId));
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepo.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException(
                        "Payment not found with transaction id: " + transactionId));
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentStatusResponse updatePaymentStatus(
            Long paymentId,
            PaymentStatusUpdateRequest request
    ) {

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found with id: " + paymentId));

        payment.setPaymentStatus(request.getPaymentStatus());

        if (request.getPaymentStatus() == PaymentStatus.SUCCESS) {

            payment.setPaymentDate(
                    request.getPaymentDate() != null
                            ? request.getPaymentDate()
                            : LocalDateTime.now()
            );

            payment.setFailureReason(null);

        } else if (request.getPaymentStatus() == PaymentStatus.FAILED) {

            payment.setFailureReason(request.getFailureReason());

        }

        Payment savedPayment = paymentRepo.save(payment);

        // ===== ORDER SYNC =====

        Order order = payment.getOrder();

        order.setPaymentStatus(request.getPaymentStatus());

        switch (request.getPaymentStatus()) {

            case SUCCESS -> {
                if (order.getOrderStatus() == OrderStatus.PENDING) {
                    order.setOrderStatus(OrderStatus.CONFIRMED);
                }
            }

            case FAILED -> {
                order.setOrderStatus(OrderStatus.PENDING);
            }

            case REFUNDED -> {
                order.setOrderStatus(OrderStatus.CANCELLED);
            }

            default -> {
                // no-op
            }
        }

        orderRepo.save(order);

        return paymentMapper.toPaymentStatusResponse(
                savedPayment,
                "Payment status updated successfully"
        );
    }

    @Override
    public List<PaymentSummaryResponse> getAllPayments() {
        List<Payment> payments = paymentRepo.findAll();
        return paymentMapper.toPaymentSummaryResponseList(payments);
    }

    @Override
    public List<PaymentSummaryResponse> getPaymentsByStatusAndDateRange(
            String paymentStatus,
            LocalDateTime start,
            LocalDateTime end) {

        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(paymentStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid payment status: " + paymentStatus);
        }

        List<Payment> payments = paymentRepo
                .findByPaymentStatusAndPaymentDateBetween(status, start, end);
        return paymentMapper.toPaymentSummaryResponseList(payments);
    }

    // ─── Helper ─────────────────────────────────────────────────────────────────

    private String resolveStatusMessage(PaymentStatus status) {
        return switch (status) {
            case SUCCESS  -> "Payment confirmed successfully";
            case FAILED   -> "Payment marked as failed";
            case REFUNDED -> "Payment refunded successfully";
            case PENDING  -> "Payment status set to pending";
        };
    }
}