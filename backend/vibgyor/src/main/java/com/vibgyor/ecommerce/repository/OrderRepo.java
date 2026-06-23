package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.Order;
import com.vibgyor.ecommerce.entity.enums.OrderStatus;
import com.vibgyor.ecommerce.entity.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepo extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product WHERE o.user.id = :userId")
    List<Order> findByUserIdWithItems(@Param("userId") Long userId);

    List<Order> findByUserId(Long userId);

    List<Order> findByOrderStatus(OrderStatus orderStatus);

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    Optional<Order> findByOrderNumber(String orderNumber);


    long countByOrderStatus(OrderStatus orderStatus);

    List<Order> findByPaymentStatus(PaymentStatus paymentStatus);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}