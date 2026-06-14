package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.Address;
import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.entity.enums.AddressType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AddressRepo extends JpaRepository<Address, Long> {

    List<Address> findByUser(User user);

    Optional<Address> findByUserAndIsDefaultTrue(User user);

    Optional<Address> findByIdAndUser(
            Long id,
            User user
    );

    List<Address> findByUserAndAddressType(User user, AddressType addressType);

}