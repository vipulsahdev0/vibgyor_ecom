package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.address.AddressRequest;
import com.vibgyor.ecommerce.dto.request.address.DefaultAddressRequest;
import com.vibgyor.ecommerce.dto.response.address.AddressResponse;
import com.vibgyor.ecommerce.dto.response.address.AddressSummaryResponse;
import com.vibgyor.ecommerce.dto.response.address.DefaultAddressResponse;
import com.vibgyor.ecommerce.entity.Address;
import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.entity.enums.AddressType;
import com.vibgyor.ecommerce.exception.ResourceNotFoundException;
import com.vibgyor.ecommerce.mapper.AddressMapper;
import com.vibgyor.ecommerce.repository.AddressRepo;
import com.vibgyor.ecommerce.repository.UserRepo;
import com.vibgyor.ecommerce.service.AddressService;
import com.vibgyor.ecommerce.util.UserLookupHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressServiceImpl implements AddressService {

    private final AddressRepo addressRepo;
    private final UserRepo userRepo;
    private final UserLookupHelper userLookupHelper;

    @Override
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userLookupHelper.findById(userId);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearExistingDefaultAddress(user);
        }

        Address address = AddressMapper.toEntity(request, user);
        Address savedAddress = addressRepo.save(address);

        if (!hasAnyDefaultAddress(user)) {
            savedAddress.setIsDefault(true);
            savedAddress = addressRepo.save(savedAddress);
        }

        return AddressMapper.toResponse(savedAddress);
    }

    @Override
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        User user = userLookupHelper.findById(userId);
        Address address = findUserAddressById(user, addressId);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearExistingDefaultAddress(user);
        }

        AddressMapper.updateEntity(address, request);
        Address updatedAddress = addressRepo.save(address);

        if (!hasAnyDefaultAddress(user)) {
            updatedAddress.setIsDefault(true);
            updatedAddress = addressRepo.save(updatedAddress);
        }

        return AddressMapper.toResponse(updatedAddress);
    }

    @Override
    public void deleteAddress(Long userId, Long addressId) {
        User user = userLookupHelper.findById(userId);
        Address address = findUserAddressById(user, addressId);

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());

        addressRepo.delete(address);

        if (wasDefault) {
            addressRepo.findByUser(user).stream()
                    .filter(a -> !Boolean.TRUE.equals(a.getIsDefault()))
                    .findFirst()
                    .ifPresent(newDefault -> {
                        newDefault.setIsDefault(true);
                        addressRepo.save(newDefault);
                    });
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getAddressById(Long userId, Long addressId) {
        User user = userLookupHelper.findById(userId);
        Address address = findUserAddressById(user, addressId);
        return AddressMapper.toResponse(address);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressSummaryResponse> getUserAddresses(Long userId) {
        User user = userLookupHelper.findById(userId);

        return addressRepo.findByUser(user)
                .stream()
                .map(AddressMapper::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressSummaryResponse> getUserAddressesByType(Long userId, AddressType addressType) {
        User user = userLookupHelper.findById(userId);

        return addressRepo.findByUserAndAddressType(user, addressType)
                .stream()
                .map(AddressMapper::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AddressResponse getDefaultAddress(Long userId) {
        User user = userLookupHelper.findById(userId);

        Address address = addressRepo.findByUserAndIsDefaultTrue(user)
                .orElseThrow(() -> new ResourceNotFoundException("Default address not found for user id: " + userId));

        return AddressMapper.toResponse(address);
    }

    @Override
    public DefaultAddressResponse setDefaultAddress(Long userId, DefaultAddressRequest request) {
        User user = userLookupHelper.findById(userId);
        Address address = findUserAddressById(user, request.getAddressId());

        clearExistingDefaultAddress(user);

        address.setIsDefault(true);
        Address updatedAddress = addressRepo.save(address);

        return AddressMapper.toDefaultAddressResponse(updatedAddress, "Default address updated successfully");
    }

    private User findUserById(Long userId) {
        return userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private Address findUserAddressById(User user, Long addressId) {
        return addressRepo.findByIdAndUser(addressId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id " + addressId));
    }

    private void clearExistingDefaultAddress(User user) {
        addressRepo.findByUserAndIsDefaultTrue(user)
                .ifPresent(existingDefault -> {
                    existingDefault.setIsDefault(false);
                    addressRepo.save(existingDefault);
                });
    }

    private boolean hasAnyDefaultAddress(User user) {
        return addressRepo.findByUserAndIsDefaultTrue(user).isPresent();
    }
}