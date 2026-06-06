package com.vibgyor.ecommerce.dto.response.address;

import com.vibgyor.ecommerce.entity.enums.AddressType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressSummaryResponse {

    private Long id;
    private String fullName;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private AddressType addressType;
    private Boolean isDefault;
}