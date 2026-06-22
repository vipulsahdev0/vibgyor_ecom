package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.response.checkout.CheckoutSummaryResponse;

public interface CheckoutService {

    CheckoutSummaryResponse getCheckoutSummary(Long userId);
}