package com.vibgyor.ecommerce.dto.response.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCountsResponse {

    private long userCount;
    private long productCount;
    private long categoryCount;
    private long orderCount;
}