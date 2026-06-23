package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.response.checkout.CheckoutItemResponse;
import com.vibgyor.ecommerce.dto.response.checkout.CheckoutSummaryResponse;
import com.vibgyor.ecommerce.entity.*;
import com.vibgyor.ecommerce.exception.BadRequestException;
import com.vibgyor.ecommerce.exception.ResourceNotFoundException;
import com.vibgyor.ecommerce.repository.*;
import com.vibgyor.ecommerce.util.ProductImageUtil;
import com.vibgyor.ecommerce.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CheckoutServiceImpl implements CheckoutService {

    private final CartRepo cartRepo;
    private final AddressRepo addressRepo;

    @Override
    public CheckoutSummaryResponse getCheckoutSummary(Long userId) {
        Cart cart = cartRepo.findByUserIdWithItems(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user " + userId));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new BadRequestException("Cart is empty, cannot proceed to checkout");
        }

        List<CheckoutItemResponse> items = cart.getCartItems().stream()
                .map(this::toCheckoutItem)
                .toList();

        BigDecimal subtotal = items.stream()
                .map(CheckoutItemResponse::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shipping = BigDecimal.ZERO; // simple rule now
        BigDecimal tax = BigDecimal.ZERO;      // extend as needed
        BigDecimal grandTotal = subtotal.add(shipping).add(tax);

        Long defaultAddressId = addressRepo.findByUserAndIsDefaultTrue(cart.getUser())
                .map(Address::getId)
                .orElse(null);

        return CheckoutSummaryResponse.builder()
                .userId(userId)
                .cartId(cart.getId())
                .items(items)
                .subtotal(subtotal)
                .shipping(shipping)
                .tax(tax)
                .grandTotal(grandTotal)
                .defaultAddressId(defaultAddressId)
                .build();
    }


    private CheckoutItemResponse toCheckoutItem(CartItem cartItem) {
        Product product = cartItem.getProduct();

        return CheckoutItemResponse.builder()
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : null)
                .productImageUrl(ProductImageUtil.extractPrimaryImageUrl(product))
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .lineTotal(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                .build();
    }
}