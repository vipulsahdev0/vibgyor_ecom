package com.vibgyor.ecommerce.dto.response.address;

import com.vibgyor.ecommerce.entity.enums.AddressType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String mobile;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private AddressType addressType;
    private Boolean isDefault;
}