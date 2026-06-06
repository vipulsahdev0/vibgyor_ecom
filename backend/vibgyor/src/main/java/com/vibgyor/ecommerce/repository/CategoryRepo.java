package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.Category;
import com.vibgyor.ecommerce.entity.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepo extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    Optional<Category> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Category> findByStatus(Status status);

    List<Category> findByNameContainingIgnoreCase(String keyword);

    long countByStatus(Status status);

    List<Category> findByStatusAndNameContainingIgnoreCase(Status status, String keyword);
}