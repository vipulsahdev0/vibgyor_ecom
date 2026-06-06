package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.Cart;
import com.vibgyor.ecommerce.entity.CartItem;
import com.vibgyor.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepo
        extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCart(
            Cart cart
    );

    Optional<CartItem> findByCartAndProduct(
            Cart cart,
            Product product
    );

    Optional<CartItem>
    findByCartIdAndProductId(
            Long cartId,
            Long productId
    );

    void deleteByCartAndProduct(
            Cart cart,
            Product product
    );

    void deleteByCart(
            Cart cart
    );
}