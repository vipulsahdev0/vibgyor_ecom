package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.request.address.AddressRequest;
import com.vibgyor.ecommerce.dto.request.address.AddressUpdateRequest;
import com.vibgyor.ecommerce.dto.request.address.DefaultAddressRequest;
import com.vibgyor.ecommerce.dto.response.address.AddressResponse;
import com.vibgyor.ecommerce.dto.response.address.AddressSummaryResponse;
import com.vibgyor.ecommerce.dto.response.address.DefaultAddressResponse;
import com.vibgyor.ecommerce.entity.enums.AddressType;
import com.vibgyor.ecommerce.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(addressService.createAddress(userId, request));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressUpdateRequest request
    ) {
        return ResponseEntity.ok(addressService.updateAddress(userId, addressId, request));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId
    ) {
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<AddressResponse> getAddressById(
            @PathVariable Long userId,
            @PathVariable Long addressId
    ) {
        return ResponseEntity.ok(addressService.getAddressById(userId, addressId));
    }

    @GetMapping
    public ResponseEntity<List<AddressSummaryResponse>> getUserAddresses(
            @PathVariable Long userId,
            @RequestParam(required = false) AddressType addressType
    ) {
        if (addressType != null) {
            return ResponseEntity.ok(addressService.getUserAddressesByType(userId, addressType));
        }
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    @GetMapping("/default")
    public ResponseEntity<AddressResponse> getDefaultAddress(@PathVariable Long userId) {
        return ResponseEntity.ok(addressService.getDefaultAddress(userId));
    }

    @PatchMapping("/default")
    public ResponseEntity<DefaultAddressResponse> setDefaultAddress(
            @PathVariable Long userId,
            @Valid @RequestBody DefaultAddressRequest request
    ) {
        return ResponseEntity.ok(addressService.setDefaultAddress(userId, request));
    }
}