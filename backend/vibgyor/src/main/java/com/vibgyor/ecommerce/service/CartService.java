package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.cart.AddToCartRequest;
import com.vibgyor.ecommerce.dto.response.cart.CartResponse;
import com.vibgyor.ecommerce.dto.response.cart.CartSummaryResponse;

public interface CartService {

    CartResponse getCartByUserId(Long userId);

    CartResponse addToCart(Long userId, AddToCartRequest request);

    CartResponse updateCartItem(Long userId, AddToCartRequest request);

    CartResponse removeFromCart(Long userId, Long productId);

    CartSummaryResponse getCartSummary(Long userId);

    void clearCart(Long userId);
}