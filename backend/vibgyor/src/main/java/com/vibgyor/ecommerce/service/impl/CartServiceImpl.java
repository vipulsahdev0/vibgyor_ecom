package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.cart.AddToCartRequest;
import com.vibgyor.ecommerce.dto.response.cart.CartResponse;
import com.vibgyor.ecommerce.dto.response.cart.CartSummaryResponse;
import com.vibgyor.ecommerce.entity.Cart;
import com.vibgyor.ecommerce.entity.CartItem;
import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.exception.BadRequestException;
import com.vibgyor.ecommerce.exception.ResourceNotFoundException;
import com.vibgyor.ecommerce.mapper.CartMapper;
import com.vibgyor.ecommerce.repository.CartItemRepo;
import com.vibgyor.ecommerce.repository.CartRepo;
import com.vibgyor.ecommerce.repository.ProductRepo;
import com.vibgyor.ecommerce.repository.UserRepo;
import com.vibgyor.ecommerce.service.CartService;
import com.vibgyor.ecommerce.util.UserLookupHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepo cartRepo;
    private final CartItemRepo cartItemRepo;
    private final ProductRepo productRepo;
    private final UserRepo userRepo;
    private final UserLookupHelper userLookupHelper;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCartByUserId(Long userId) {
        Cart cart = cartRepo.findByUserIdWithItems(userId)
                .orElse(null);

        if (cart == null) {
            User user = userLookupHelper.findById(userId);
            Cart emptyCart = Cart.builder()
                    .user(user)
                    .build();
            return CartMapper.toCartResponse(emptyCart);
        }

        return CartMapper.toCartResponse(cart);
    }

    @Override
    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = findProductById(request.getProductId());

        validateQuantity(request.getQuantity());
        validateStock(product, request.getQuantity());

        CartItem cartItem = cartItemRepo.findByCartAndProduct(cart, product)
                .orElseGet(() -> CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(0)
                        .unitPrice(resolveUnitPrice(product))
                        .build());

        int newQuantity = cartItem.getQuantity() + request.getQuantity();
        validateStock(product, newQuantity);

        cartItem.setQuantity(newQuantity);
        cartItem.setUnitPrice(resolveUnitPrice(product));
        cartItemRepo.save(cartItem);

        Cart loadedCart = cartRepo.findByUserIdWithItems(userId).orElse(cart);
        return CartMapper.toCartResponse(loadedCart);
    }

    @Override
    public CartResponse updateCartItem(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = findProductById(request.getProductId());

        validateQuantity(request.getQuantity());
        validateStock(product, request.getQuantity());

        CartItem cartItem = cartItemRepo.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found for product id: " + request.getProductId()));

        cartItem.setQuantity(request.getQuantity());
        cartItem.setUnitPrice(resolveUnitPrice(product));
        cartItemRepo.save(cartItem);

        Cart loadedCart = cartRepo.findByUserIdWithItems(userId).orElse(cart);
        return CartMapper.toCartResponse(loadedCart);
    }

    @Override
    public CartResponse removeFromCart(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        Product product = findProductById(productId);

        cartItemRepo.deleteByCartAndProduct(cart, product);

        Cart loadedCart = cartRepo.findByUserIdWithItems(userId).orElse(cart);
        return CartMapper.toCartResponse(loadedCart);
    }

    @Override
    @Transactional(readOnly = true)
    public CartSummaryResponse getCartSummary(Long userId) {
        Cart cart = cartRepo.findByUserIdWithItems(userId)
                .orElse(null);

        if (cart == null) {
            User user = userLookupHelper.findById(userId);
            Cart emptyCart = Cart.builder()
                    .user(user)
                    .build();
            return CartMapper.toCartSummaryResponse(emptyCart);
        }

        return CartMapper.toCartSummaryResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);

        cartItemRepo.deleteByCart(cart);

        cart.getCartItems().clear();
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepo.findByUserId(userId)
                .orElseGet(() -> {
                    User user = findUserById(userId);
                    Cart cart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepo.save(cart);
                });
    }

    private User findUserById(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private Product findProductById(Long productId) {
        return productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    private void validateQuantity(Integer quantity) {
        if (quantity == null || quantity < 1) {
            throw new BadRequestException("Quantity must be at least 1");
        }
    }

    private void validateStock(Product product, Integer requestedQuantity) {
        if (product.getStockQuantity() == null || product.getStockQuantity() < requestedQuantity) {
            throw new BadRequestException("Insufficient stock for product: " + product.getName());
        }
    }

    private java.math.BigDecimal resolveUnitPrice(Product product) {
        if (product.getDiscountedPrice() != null
                && product.getDiscountedPrice().compareTo(java.math.BigDecimal.ZERO) > 0
                && product.getDiscountedPrice().compareTo(product.getPrice()) < 0) {
            return product.getDiscountedPrice();
        }
        return product.getPrice();
    }
}