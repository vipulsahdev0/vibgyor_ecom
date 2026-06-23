package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.Order;
import com.vibgyor.ecommerce.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepo extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);
}