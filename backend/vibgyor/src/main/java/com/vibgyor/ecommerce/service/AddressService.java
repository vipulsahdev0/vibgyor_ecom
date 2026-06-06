package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.address.AddressRequest;
import com.vibgyor.ecommerce.dto.request.address.AddressUpdateRequest;
import com.vibgyor.ecommerce.dto.request.address.DefaultAddressRequest;
import com.vibgyor.ecommerce.dto.response.address.AddressResponse;
import com.vibgyor.ecommerce.dto.response.address.AddressSummaryResponse;
import com.vibgyor.ecommerce.dto.response.address.DefaultAddressResponse;
import com.vibgyor.ecommerce.entity.enums.AddressType;

import java.util.List;

public interface AddressService {

    AddressResponse createAddress(Long userId, AddressRequest request);

    AddressResponse updateAddress(Long userId, Long addressId, AddressUpdateRequest request);

    void deleteAddress(Long userId, Long addressId);

    AddressResponse getAddressById(Long userId, Long addressId);

    List<AddressSummaryResponse> getUserAddresses(Long userId);

    List<AddressSummaryResponse> getUserAddressesByType(Long userId, AddressType addressType);

    AddressResponse getDefaultAddress(Long userId);

    DefaultAddressResponse setDefaultAddress(Long userId, DefaultAddressRequest request);
}