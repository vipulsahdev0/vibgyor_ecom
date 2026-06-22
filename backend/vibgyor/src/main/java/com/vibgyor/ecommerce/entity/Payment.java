package com.vibgyor.ecommerce.entity;

import com.vibgyor.ecommerce.entity.enums.PaymentMethod;
import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // For gateway payment/order id (Razorpay, etc.)
    @Column(name = "payment_reference", length = 100, unique = true)
    private String paymentReference;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    // For simple offline tracking or alternate reference
    @Column(name = "transaction_id", length = 100, unique = true)
    private String transactionId;

    // When payment was completed (if SUCCESS)
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    // For FAILED or REFUNDED cases
    @Column(name = "failure_reason", length = 1000)
    private String failureReason;

    // Raw provider JSON / message; useful for future Razorpay integration
    @Column(name = "provider_response", length = 2000)
    private String providerResponse;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
}