package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.User;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.entity.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepo
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(
            String email
    );

    boolean existsByEmail(
            String email
    );

    List<User> findByRole(
            UserRole role
    );

    List<User> findByStatus(
            Status status
    );

    List<User>
    findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName,
            String lastName
    );

    long countByStatus(
            Status status
    );

    long countByRole(
            UserRole role
    );
}