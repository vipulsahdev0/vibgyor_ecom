package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.payment.CreatePaymentRequest;
import com.vibgyor.ecommerce.dto.request.payment.PaymentRequest;
import com.vibgyor.ecommerce.dto.request.payment.PaymentStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.request.payment.VerifyPaymentRequest;
import com.vibgyor.ecommerce.dto.response.payment.PaymentResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentStatusResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentSummaryResponse;
import com.vibgyor.ecommerce.entity.Order;
import com.vibgyor.ecommerce.entity.Payment;
import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.enums.OrderStatus;
import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import com.vibgyor.ecommerce.exception.BadRequestException;
import com.vibgyor.ecommerce.exception.ForbiddenException;
import com.vibgyor.ecommerce.exception.ResourceNotFoundException;
import com.vibgyor.ecommerce.mapper.PaymentMapper;
import com.vibgyor.ecommerce.repository.CartRepo;
import com.vibgyor.ecommerce.repository.OrderRepo;
import com.vibgyor.ecommerce.repository.PaymentRepo;
import com.vibgyor.ecommerce.repository.ProductRepo;
import com.vibgyor.ecommerce.service.PaymentService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepo orderRepo;
    private final PaymentRepo paymentRepo;
    private final CartRepo cartRepo;
    private final ProductRepo productRepo;
    private final PaymentMapper paymentMapper;

    // ─── Legacy-style API (admin / internal use, no ownership check) ──────────

    @Override
    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {
        Order order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + request.getOrderId()));

        paymentRepo.findByOrderId(request.getOrderId()).ifPresent(existing -> {
            throw new BadRequestException(
                    "A payment record already exists for order id: " + request.getOrderId()
            );
        });

        if (request.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new BadRequestException(
                    "Payment amount (" + request.getAmount()
                            + ") does not match order total (" + order.getTotalAmount() + ")"
            );
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .transactionId(request.getTransactionId())
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepo.save(payment);

        order.setPaymentStatus(PaymentStatus.PENDING);
        orderRepo.save(order);

        return paymentMapper.toPaymentResponse(saved);
    }

    // ─── Secured overload: validates caller owns the order ───────────────────

    @Override
    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request, Long callerUserId) {
        Order order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + request.getOrderId()));

        if (!order.getUser().getId().equals(callerUserId)) {
            throw new ForbiddenException(
                    "You are not authorized to create a payment for this order");
        }

        return recordPayment(request);
    }

    // ─── Read-only fetches ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with id: " + paymentId));
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId, Long callerUserId) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with id: " + paymentId));
        validatePaymentOwnership(payment, callerUserId);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepo.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for order id: " + orderId));
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId, Long callerUserId) {
        Payment payment = paymentRepo.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for order id: " + orderId));
        validatePaymentOwnership(payment, callerUserId);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepo.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with transaction id: " + transactionId));
        return paymentMapper.toPaymentResponse(payment);
    }

    // ─── Status management ────────────────────────────────────────────────────

    @Override
    @Transactional
    public PaymentStatusResponse updatePaymentStatus(Long paymentId,
                                                     PaymentStatusUpdateRequest request) {
        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with id: " + paymentId));

        payment.setPaymentStatus(request.getPaymentStatus());

        if (request.getFailureReason() != null) {
            payment.setFailureReason(request.getFailureReason());
        }

        if (request.getPaymentDate() != null) {
            payment.setPaymentDate(request.getPaymentDate());
        } else if (request.getPaymentStatus() == PaymentStatus.SUCCESS) {
            payment.setPaymentDate(LocalDateTime.now());
        }

        paymentRepo.save(payment);

        Order order = payment.getOrder();
        if (order != null) {
            order.setPaymentStatus(request.getPaymentStatus());
            orderRepo.save(order);
        }

        return paymentMapper.toPaymentStatusResponse(payment,
                resolveStatusMessage(request.getPaymentStatus()));
    }

    // ─── Admin listings ───────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<PaymentSummaryResponse> getAllPayments() {
        return paymentMapper.toPaymentSummaryResponseList(paymentRepo.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentSummaryResponse> getPaymentsByStatusAndDateRange(
            String paymentStatus,
            LocalDateTime start,
            LocalDateTime end) {

        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(paymentStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid payment status: " + paymentStatus);
        }

        return paymentMapper.toPaymentSummaryResponseList(
                paymentRepo.findByPaymentStatusAndPaymentDateBetween(status, start, end));
    }

    // ─── New checkout lifecycle (legacy single-arg, internal/admin use) ───────

    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request) {
        Order order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + request.getOrderId()));

        if (request.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new IllegalArgumentException(
                    "Payment amount (" + request.getAmount()
                            + ") does not match order total (" + order.getTotalAmount() + ")");
        }

        paymentRepo.findByOrderId(request.getOrderId()).ifPresent(existing -> {
            throw new IllegalArgumentException(
                    "Payment already exists for order id: " + request.getOrderId());
        });

        Payment payment = Payment.builder()
                .order(order)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Payment saved = paymentRepo.save(payment);

        order.setPaymentStatus(PaymentStatus.PENDING);
        orderRepo.save(order);

        return paymentMapper.toPaymentResponse(saved);
    }

    // ─── Secured overload: validates caller owns the order ───────────────────

    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request, Long callerUserId) {
        Order order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + request.getOrderId()));

        if (!order.getUser().getId().equals(callerUserId)) {
            throw new ForbiddenException(
                    "You are not authorized to create a payment for this order");
        }

        return createPayment(request);
    }

    // ─── Verify payment (legacy single-arg, internal use) ────────────────────

    @Override
    @Transactional
    public PaymentResponse verifyAndUpdatePayment(VerifyPaymentRequest request) {
        Order order = orderRepo.findByIdWithItems(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Order not found with id: " + request.getOrderId()));

        Payment payment = paymentRepo.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for order: " + request.getOrderId()));

        payment.setPaymentReference(request.getPaymentReference());
        payment.setProviderResponse(request.getProviderResponse());

        if (request.getTransactionId() != null && !request.getTransactionId().isBlank()) {
            payment.setTransactionId(request.getTransactionId());
        }

        if (request.isSuccess()) {
            payment.setPaymentStatus(PaymentStatus.SUCCESS);
            payment.setPaymentDate(LocalDateTime.now());
            payment.setFailureReason(null);

            order.setPaymentStatus(PaymentStatus.SUCCESS);
            order.setOrderStatus(OrderStatus.CONFIRMED);

            // Reduce stock — guarded against going negative
            order.getOrderItems().forEach(item -> {
                Product p = item.getProduct();
                int newStock = Math.max(0, p.getStockQuantity() - item.getQuantity());
                p.setStockQuantity(newStock);
                productRepo.save(p);
            });

            // Clear cart
            cartRepo.findByUserId(order.getUser().getId()).ifPresent(cart -> {
                cart.getCartItems().clear();
                cartRepo.save(cart);
            });

        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setPaymentDate(null);

            order.setPaymentStatus(PaymentStatus.FAILED);
            order.setOrderStatus(OrderStatus.PENDING_PAYMENT);
        }

        paymentRepo.save(payment);
        orderRepo.save(order);

        return paymentMapper.toPaymentResponse(payment);
    }

    // ─── Secured overload: validates caller owns the order ───────────────────

    @Override
    @Transactional
    public PaymentResponse verifyAndUpdatePayment(VerifyPaymentRequest request, Long callerUserId) {
        Payment payment = paymentRepo.findByTransactionId(request.getTransactionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found for transaction: " + request.getTransactionId()));

        validatePaymentOwnership(payment, callerUserId);

        return verifyAndUpdatePayment(request);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    /**
     * Allows ADMIN through unconditionally.
     * For regular users, validates the payment's order belongs to callerUserId.
     */
    private void validatePaymentOwnership(Payment payment, Long callerUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) return;

        Order order = payment.getOrder();
        if (order == null || !order.getUser().getId().equals(callerUserId)) {
            throw new ForbiddenException("You are not authorized to access this payment");
        }
    }

    private String resolveStatusMessage(PaymentStatus status) {
        return switch (status) {
            case SUCCESS  -> "Payment confirmed successfully";
            case FAILED   -> "Payment marked as failed";
            case REFUNDED -> "Payment refunded successfully";
            case PENDING  -> "Payment status set to pending";
        };
    }
}