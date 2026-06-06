package com.vibgyor.ecommerce.dto.request.address;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DefaultAddressRequest {

    @NotNull(message = "Address ID is required")
    private Long addressId;
}