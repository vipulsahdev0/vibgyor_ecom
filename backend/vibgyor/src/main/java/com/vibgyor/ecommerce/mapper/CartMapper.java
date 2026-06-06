package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.response.cart.CartItemResponse;
import com.vibgyor.ecommerce.dto.response.cart.CartResponse;
import com.vibgyor.ecommerce.dto.response.cart.CartSummaryResponse;
import com.vibgyor.ecommerce.entity.Cart;
import com.vibgyor.ecommerce.entity.CartItem;
import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.ProductImage;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class CartMapper {

    private CartMapper() {
    }

    public static CartItemResponse toCartItemResponse(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }

        Product product = cartItem.getProduct();

        return CartItemResponse.builder()
                .cartItemId(cartItem.getId())
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .productImageUrl(extractPrimaryImageUrl(product))
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .lineTotal(calculateLineTotal(cartItem))
                .addedAt(cartItem.getAddedAt())
                .build();
    }

    public static List<CartItemResponse> toCartItemResponseList(Iterable<CartItem> cartItems) {
        List<CartItem> items = toList(cartItems);

        return items.stream()
                .sorted(Comparator.comparing(CartItem::getAddedAt, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(CartMapper::toCartItemResponse)
                .toList();
    }

    public static CartResponse toCartResponse(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItem> cartItems = toList(cart.getCartItems());
        List<CartItemResponse> itemResponses = toCartItemResponseList(cartItems);

        BigDecimal subtotal = calculateSubtotal(cartItems);
        BigDecimal discountTotal = calculateDiscountTotal(cartItems);
        BigDecimal grandTotal = subtotal.subtract(discountTotal);

        return CartResponse.builder()
                .cartId(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(itemResponses)
                .totalItems(calculateTotalItems(cartItems))
                .subtotal(subtotal)
                .discountTotal(discountTotal)
                .grandTotal(grandTotal)
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    public static CartSummaryResponse toCartSummaryResponse(Cart cart) {
        if (cart == null) {
            return null;
        }

        List<CartItem> cartItems = toList(cart.getCartItems());
        BigDecimal subtotal = calculateSubtotal(cartItems);
        BigDecimal discountTotal = calculateDiscountTotal(cartItems);

        return CartSummaryResponse.builder()
                .cartId(cart.getId())
                .totalItems(calculateTotalItems(cartItems))
                .grandTotal(subtotal.subtract(discountTotal))
                .build();
    }

    private static List<CartItem> toList(Iterable<CartItem> cartItems) {
        if (cartItems == null) {
            return Collections.emptyList();
        }

        List<CartItem> items = new ArrayList<>();
        cartItems.forEach(items::add);
        return items;
    }

    private static Integer calculateTotalItems(List<CartItem> cartItems) {
        return cartItems.stream()
                .map(CartItem::getQuantity)
                .filter(quantity -> quantity != null)
                .reduce(0, Integer::sum);
    }

    private static BigDecimal calculateSubtotal(List<CartItem> cartItems) {
        return cartItems.stream()
                .map(item -> {
                    Product product = item.getProduct();
                    BigDecimal price = product != null ? product.getPrice() : BigDecimal.ZERO;
                    Integer quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                    return price.multiply(BigDecimal.valueOf(quantity));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal calculateDiscountTotal(List<CartItem> cartItems) {
        return cartItems.stream()
                .map(CartMapper::calculateItemDiscount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal calculateItemDiscount(CartItem cartItem) {
        Product product = cartItem.getProduct();
        if (product == null || product.getDiscountedPrice() == null || product.getPrice() == null) {
            return BigDecimal.ZERO;
        }

        if (product.getDiscountedPrice().compareTo(product.getPrice()) >= 0) {
            return BigDecimal.ZERO;
        }

        Integer quantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;

        return product.getPrice()
                .subtract(product.getDiscountedPrice())
                .multiply(BigDecimal.valueOf(quantity));
    }

    private static BigDecimal calculateLineTotal(CartItem cartItem) {
        if (cartItem.getUnitPrice() == null || cartItem.getQuantity() == null) {
            return BigDecimal.ZERO;
        }

        return cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
    }

    private static String extractPrimaryImageUrl(Product product) {
        if (product == null || product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }

        return product.getImages().stream()
                .filter(image -> Boolean.TRUE.equals(image.getIsPrimary()))
                .findFirst()
                .or(() -> product.getImages().stream()
                        .sorted(Comparator.comparing(
                                ProductImage::getDisplayOrder,
                                Comparator.nullsLast(Integer::compareTo)
                        ))
                        .findFirst())
                .map(ProductImage::getImageUrl)
                .orElse(null);
    }
}