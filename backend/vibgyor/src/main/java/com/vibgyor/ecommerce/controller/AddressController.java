package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.common.ApiResponse;
import com.vibgyor.ecommerce.dto.request.address.AddressRequest;
import com.vibgyor.ecommerce.dto.request.address.DefaultAddressRequest;
import com.vibgyor.ecommerce.dto.response.address.AddressResponse;
import com.vibgyor.ecommerce.dto.response.address.AddressSummaryResponse;
import com.vibgyor.ecommerce.dto.response.address.DefaultAddressResponse;
import com.vibgyor.ecommerce.entity.enums.AddressType;
import com.vibgyor.ecommerce.security.SecurityOwnershipValidator;
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
    private final SecurityOwnershipValidator ownershipValidator;

    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> createAddress(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest request) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Address created successfully",
                        addressService.createAddress(userId, request)));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest request) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Address updated successfully",
                addressService.updateAddress(userId, addressId, request)));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId) {
        addressService.deleteAddress(userId, addressId);
        return ResponseEntity.ok(ApiResponse.ok("Address deleted successfully", null));
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> getAddressById(
            @PathVariable Long userId,
            @PathVariable Long addressId) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Address fetched successfully",
                addressService.getAddressById(userId, addressId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressSummaryResponse>>> getUserAddresses(
            @PathVariable Long userId,
            @RequestParam(required = false) AddressType addressType) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        List<AddressSummaryResponse> addresses = (addressType != null)
                ? addressService.getUserAddressesByType(userId, addressType)
                : addressService.getUserAddresses(userId);
        return ResponseEntity.ok(ApiResponse.ok("Addresses fetched successfully", addresses));
    }

    @GetMapping("/default")
    public ResponseEntity<ApiResponse<AddressResponse>> getDefaultAddress(
            @PathVariable Long userId) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Default address fetched successfully",
                addressService.getDefaultAddress(userId)));
    }

    @PatchMapping("/default")
    public ResponseEntity<ApiResponse<DefaultAddressResponse>> setDefaultAddress(
            @PathVariable Long userId,
            @Valid @RequestBody DefaultAddressRequest request) {
        ownershipValidator.validateOwnerOrAdmin(userId);
        return ResponseEntity.ok(ApiResponse.ok("Default address updated successfully",
                addressService.setDefaultAddress(userId, request)));
    }
}