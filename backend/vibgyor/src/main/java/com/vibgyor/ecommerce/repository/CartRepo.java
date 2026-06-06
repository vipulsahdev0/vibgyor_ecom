package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface CartRepo extends JpaRepository<Cart, Long> {

    @Query("""
        SELECT DISTINCT c
        FROM Cart c
        LEFT JOIN FETCH c.cartItems ci
        LEFT JOIN FETCH ci.product p
        LEFT JOIN FETCH p.category
        LEFT JOIN FETCH p.images
        WHERE c.user.id = :userId
    """)
    Optional<Cart> findByUserIdWithItems(Long userId);

    Optional<Cart> findByUserId(Long userId);
}