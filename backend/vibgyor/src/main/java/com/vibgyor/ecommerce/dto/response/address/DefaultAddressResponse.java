package com.vibgyor.ecommerce.dto.response.address;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DefaultAddressResponse {

    private Long addressId;
    private Long userId;
    private Boolean isDefault;
    private String message;
}