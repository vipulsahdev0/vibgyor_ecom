package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.Wishlist;
import com.vibgyor.ecommerce.entity.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepo extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem> findByWishlist(Wishlist wishlist);

    Optional<WishlistItem> findByWishlistAndProduct(
            Wishlist wishlist,
            Product product
    );

    Optional<WishlistItem> findByWishlistIdAndProductId(
            Long wishlistId,
            Long productId
    );

    void deleteByWishlistAndProduct(
            Wishlist wishlist,
            Product product
    );

    void deleteByWishlist(Wishlist wishlist);
}