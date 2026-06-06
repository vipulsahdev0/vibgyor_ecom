package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.request.address.AddressRequest;
import com.vibgyor.ecommerce.dto.request.address.AddressUpdateRequest;
import com.vibgyor.ecommerce.dto.response.address.AddressResponse;
import com.vibgyor.ecommerce.dto.response.address.AddressSummaryResponse;
import com.vibgyor.ecommerce.dto.response.address.DefaultAddressResponse;
import com.vibgyor.ecommerce.entity.Address;
import com.vibgyor.ecommerce.entity.User;

public class AddressMapper {

    private AddressMapper() {
    }

    public static Address toEntity(AddressRequest request, User user) {
        if (request == null) {
            return null;
        }

        return Address.builder()
                .fullName(request.getFullName())
                .mobile(request.getMobile())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())
                .zipCode(request.getZipCode())
                .addressType(request.getAddressType())
                .isDefault(Boolean.TRUE.equals(request.getIsDefault()))
                .user(user)
                .build();
    }

    public static void updateEntity(Address address, AddressUpdateRequest request) {
        if (address == null || request == null) {
            return;
        }

        address.setFullName(request.getFullName());
        address.setMobile(request.getMobile());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setCountry(request.getCountry());
        address.setZipCode(request.getZipCode());
        address.setAddressType(request.getAddressType());
        address.setIsDefault(Boolean.TRUE.equals(request.getIsDefault()));
    }

    public static AddressResponse toResponse(Address address) {
        if (address == null) {
            return null;
        }

        return AddressResponse.builder()
                .id(address.getId())
                .userId(address.getUser() != null ? address.getUser().getId() : null)
                .fullName(address.getFullName())
                .mobile(address.getMobile())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .zipCode(address.getZipCode())
                .addressType(address.getAddressType())
                .isDefault(address.getIsDefault())
                .build();
    }

    public static AddressSummaryResponse toSummaryResponse(Address address) {
        if (address == null) {
            return null;
        }

        return AddressSummaryResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .city(address.getCity())
                .state(address.getState())
                .country(address.getCountry())
                .zipCode(address.getZipCode())
                .addressType(address.getAddressType())
                .isDefault(address.getIsDefault())
                .build();
    }

    public static DefaultAddressResponse toDefaultAddressResponse(Address address, String message) {
        if (address == null) {
            return null;
        }

        return DefaultAddressResponse.builder()
                .addressId(address.getId())
                .userId(address.getUser() != null ? address.getUser().getId() : null)
                .isDefault(address.getIsDefault())
                .message(message)
                .build();
    }
}