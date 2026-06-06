package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.wishlist.AddToWishlistRequest;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistResponse;
import com.vibgyor.ecommerce.dto.response.wishlist.WishlistSummaryResponse;
import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.entity.Wishlist;
import com.vibgyor.ecommerce.entity.WishlistItem;
import com.vibgyor.ecommerce.mapper.WishlistMapper;
import com.vibgyor.ecommerce.repository.ProductRepo;
import com.vibgyor.ecommerce.repository.UserRepo;
import com.vibgyor.ecommerce.repository.WishlistItemRepo;
import com.vibgyor.ecommerce.repository.WishlistRepo;
import com.vibgyor.ecommerce.service.WishlistService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepo wishlistRepo;
    private final WishlistItemRepo wishlistItemRepo;
    private final UserRepo userRepo;
    private final ProductRepo productRepo;
    private final WishlistMapper wishlistMapper;

    @Override
    public WishlistResponse getWishlistByUserId(Long userId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        return wishlistMapper.toWishlistResponse(wishlist);
    }

    @Override
    @Transactional
    public WishlistResponse addToWishlist(Long userId, AddToWishlistRequest request) {

        Wishlist wishlist = getOrCreateWishlist(userId);

        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException(
                        "Product not found with id: " + request.getProductId()));

        // Prevent duplicate entries — silently return current wishlist if already present
        boolean alreadyExists = wishlistItemRepo
                .findByWishlistAndProduct(wishlist, product)
                .isPresent();

        if (alreadyExists) {
            return wishlistMapper.toWishlistResponse(wishlist);
        }

        WishlistItem newItem = WishlistItem.builder()
                .wishlist(wishlist)
                .product(product)
                .build();

        wishlistItemRepo.save(newItem);
        wishlist.getWishlistItems().add(newItem);

        return wishlistMapper.toWishlistResponse(wishlist);
    }

    @Override
    @Transactional
    public WishlistResponse removeFromWishlist(Long userId, Long productId) {

        Wishlist wishlist = getOrCreateWishlist(userId);

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException(
                        "Product not found with id: " + productId));

        wishlistItemRepo.findByWishlistAndProduct(wishlist, product)
                .orElseThrow(() -> new RuntimeException(
                        "Product is not in wishlist"));

        wishlistItemRepo.deleteByWishlistAndProduct(wishlist, product);
        wishlist.getWishlistItems().removeIf(
                item -> item.getProduct().getId().equals(productId));

        return wishlistMapper.toWishlistResponse(wishlist);
    }

    @Override
    @Transactional
    public WishlistSummaryResponse clearWishlist(Long userId) {

        Wishlist wishlist = getOrCreateWishlist(userId);

        wishlistItemRepo.deleteByWishlist(wishlist);
        wishlist.getWishlistItems().clear();

        return wishlistMapper.toWishlistSummaryResponse(wishlist);
    }

    @Override
    public boolean isProductInWishlist(Long userId, Long productId) {

        return wishlistRepo.findByUserId(userId)
                .map(wishlist -> wishlistItemRepo
                        .findByWishlistIdAndProductId(wishlist.getId(), productId)
                        .isPresent())
                .orElse(false);
    }

    // ─── Helper ─────────────────────────────────────────────────────────────────

    private Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepo.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepo.findById(userId)
                            .orElseThrow(() -> new RuntimeException(
                                    "User not found with id: " + userId));
                    Wishlist newWishlist = Wishlist.builder()
                            .user(user)
                            .build();
                    return wishlistRepo.save(newWishlist);
                });
    }
}