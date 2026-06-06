package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.order.OrderStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.request.order.PlaceOrderRequest;
import com.vibgyor.ecommerce.dto.response.order.OrderResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderStatusResponse;
import com.vibgyor.ecommerce.dto.response.order.OrderSummaryResponse;

import java.util.List;

public interface OrderService {

    // User: place an order from their active cart
    OrderResponse placeOrder(Long userId, PlaceOrderRequest request);

    // User: get all their orders
    List<OrderSummaryResponse> getOrdersByUser(Long userId);

    // User/Admin: get full order detail by ID
    OrderResponse getOrderById(Long orderId);

    // User/Admin: get order by order number
    OrderResponse getOrderByOrderNumber(String orderNumber);

    // Admin: get all orders
    List<OrderSummaryResponse> getAllOrders();

    // Admin: update order status and/or payment status
    OrderStatusResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request);

    // Admin: cancel an order
    OrderStatusResponse cancelOrder(Long orderId);
}