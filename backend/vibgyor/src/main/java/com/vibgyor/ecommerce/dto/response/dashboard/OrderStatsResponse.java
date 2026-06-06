package com.vibgyor.ecommerce.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatsResponse {

    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
    private long cancelledOrders;
}