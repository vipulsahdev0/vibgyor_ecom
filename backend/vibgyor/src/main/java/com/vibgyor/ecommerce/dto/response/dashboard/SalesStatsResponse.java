package com.vibgyor.ecommerce.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesStatsResponse {

    private BigDecimal totalSales;
    private BigDecimal averageOrderValue;
    private long paidOrderCount;
    private long totalPaymentCount;
}