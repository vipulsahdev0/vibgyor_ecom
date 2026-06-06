package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepo extends JpaRepository<Wishlist, Long> {

    Optional<Wishlist> findByUser(User user);

    Optional<Wishlist> findByUserId(Long userId);
}