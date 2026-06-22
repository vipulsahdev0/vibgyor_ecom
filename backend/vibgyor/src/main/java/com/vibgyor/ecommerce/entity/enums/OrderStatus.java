package com.vibgyor.ecommerce.entity.enums;

public enum OrderStatus {
    PENDING_PAYMENT,   // created but waiting for payment
    CONFIRMED,         // payment success, stock reduced
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED,
    REFUNDED
}