package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.payment.CreatePaymentRequest;
import com.vibgyor.ecommerce.dto.request.payment.PaymentStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.request.payment.VerifyPaymentRequest;
import com.vibgyor.ecommerce.dto.response.payment.PaymentResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentStatusResponse;
import com.vibgyor.ecommerce.dto.response.payment.PaymentSummaryResponse;
import com.vibgyor.ecommerce.entity.Order;
import com.vibgyor.ecommerce.entity.Payment;
import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.enums.OrderStatus;
import com.vibgyor.ecommerce.entity.enums.PaymentMethod;
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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

    @Override
    @Transactional
    public PaymentResponse recordPayment(CreatePaymentRequest request, Long callerUserId) {
        Order order = findOwnedOrder(request.getOrderId(), callerUserId);

        Payment payment = createPendingPayment(
                order,
                request.getAmount(),
                request.getPaymentMethod(),
                request.getTransactionId()
        );

        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request, Long callerUserId) {
        Order order = findOwnedOrder(request.getOrderId(), callerUserId);

        Payment payment = createPendingPayment(
                order,
                request.getAmount(),
                request.getPaymentMethod(),
                null
        );

        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse verifyAndUpdatePayment(VerifyPaymentRequest request, Long callerUserId) {
        Order order = findOwnedOrderWithItems(request.getOrderId(), callerUserId);
        Payment payment = findPaymentByOrderId(order.getId());

        payment.setPaymentReference(request.getPaymentReference());
        payment.setProviderResponse(request.getProviderResponse());

        if (request.getTransactionId() != null && !request.getTransactionId().isBlank()) {
            payment.setTransactionId(request.getTransactionId());
        }

        if (request.isSuccess()) {
            markPaymentSuccess(payment, order);
        } else {
            markPaymentFailed(payment, order);
        }

        paymentRepo.save(payment);
        orderRepo.save(order);

        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId, Long callerUserId) {
        Payment payment = findPaymentById(paymentId);
        validatePaymentOwnership(payment, callerUserId);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId, Long callerUserId) {
        Payment payment = findPaymentByOrderId(orderId);
        validatePaymentOwnership(payment, callerUserId);
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepo.findByTransactionId(transactionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found with transaction id: " + transactionId));
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentStatusResponse updatePaymentStatus(Long paymentId, PaymentStatusUpdateRequest request) {
        Payment payment = findPaymentById(paymentId);

        payment.setPaymentStatus(request.getPaymentStatus());

        if (request.getFailureReason() != null && !request.getFailureReason().isBlank()) {
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

        return paymentMapper.toPaymentStatusResponse(
                payment,
                resolveStatusMessage(request.getPaymentStatus())
        );
    }

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
            LocalDateTime end
    ) {
        PaymentStatus status;
        try {
            status = PaymentStatus.valueOf(paymentStatus.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid payment status: " + paymentStatus);
        }

        return paymentMapper.toPaymentSummaryResponseList(
                paymentRepo.findByPaymentStatusAndPaymentDateBetween(status, start, end)
        );
    }

    private Order findOwnedOrder(Long orderId, Long callerUserId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdmin() && !order.getUser().getId().equals(callerUserId)) {
            throw new ForbiddenException("You are not authorized to access this order");
        }

        return order;
    }

    private Order findOwnedOrderWithItems(Long orderId, Long callerUserId) {
        Order order = orderRepo.findByIdWithItems(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Order not found with id: " + orderId));

        if (!isAdmin() && !order.getUser().getId().equals(callerUserId)) {
            throw new ForbiddenException("You are not authorized to access this order");
        }

        return order;
    }

    private Payment findPaymentById(Long paymentId) {
        return paymentRepo.findById(paymentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found with id: " + paymentId));
    }

    private Payment findPaymentByOrderId(Long orderId) {
        return paymentRepo.findByOrderId(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found for order id: " + orderId));
    }

    private Payment createPendingPayment(
            Order order,
            BigDecimal amount,
            PaymentMethod paymentMethod,
            String transactionId
    ) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        if (amount.compareTo(order.getTotalAmount()) != 0) {
            throw new BadRequestException(
                    "Payment amount (" + amount + ") does not match order total (" + order.getTotalAmount() + ")"
            );
        }

        paymentRepo.findByOrderId(order.getId()).ifPresent(existing -> {
            throw new BadRequestException("Payment already exists for order id: " + order.getId());
        });

        Payment payment = Payment.builder()
                .order(order)
                .amount(amount)
                .paymentMethod(paymentMethod)
                .transactionId(transactionId)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        Payment savedPayment = paymentRepo.save(payment);

        order.setPaymentStatus(PaymentStatus.PENDING);
        orderRepo.save(order);

        return savedPayment;
    }

    private void markPaymentSuccess(Payment payment, Order order) {
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setFailureReason(null);

        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setOrderStatus(OrderStatus.CONFIRMED);

        order.getOrderItems().forEach(item -> {
            Product product = item.getProduct();
            int newStock = Math.max(0, product.getStockQuantity() - item.getQuantity());
            product.setStockQuantity(newStock);
            productRepo.save(product);
        });

        cartRepo.findByUserId(order.getUser().getId()).ifPresent(cart -> {
            cart.getCartItems().clear();
            cartRepo.save(cart);
        });
    }

    private void markPaymentFailed(Payment payment, Order order) {
        payment.setPaymentStatus(PaymentStatus.FAILED);
        payment.setPaymentDate(null);

        order.setPaymentStatus(PaymentStatus.FAILED);
        order.setOrderStatus(OrderStatus.PENDING_PAYMENT);
    }

    private void validatePaymentOwnership(Payment payment, Long callerUserId) {
        if (isAdmin()) {
            return;
        }

        Order order = payment.getOrder();
        if (order == null || !order.getUser().getId().equals(callerUserId)) {
            throw new ForbiddenException("You are not authorized to access this payment");
        }
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private String resolveStatusMessage(PaymentStatus status) {
        return switch (status) {
            case SUCCESS -> "Payment confirmed successfully";
            case FAILED -> "Payment marked as failed";
            case REFUNDED -> "Payment refunded successfully";
            case PENDING -> "Payment status set to pending";
        };
    }
}