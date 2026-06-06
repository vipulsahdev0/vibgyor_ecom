package com.vibgyor.ecommerce.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryResponse {

    private AdminCountsResponse counts;
    private SalesStatsResponse salesStats;
    private OrderStatsResponse orderStats;
}