package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.Order;
import com.vibgyor.ecommerce.entity.Payment;
import com.vibgyor.ecommerce.entity.enums.PaymentMethod;
import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepo extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrder(Order order);

    Optional<Payment> findByOrderId(Long orderId);

    Optional<Payment> findByTransactionId(String transactionId);

    List<Payment> findByPaymentMethod(PaymentMethod paymentMethod);

    List<Payment> findByPaymentStatusAndPaymentDateBetween(
            PaymentStatus paymentStatus,
            LocalDateTime start,
            LocalDateTime end
    );
}