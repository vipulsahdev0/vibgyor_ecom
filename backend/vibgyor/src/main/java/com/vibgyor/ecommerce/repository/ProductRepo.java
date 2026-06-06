package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.Category;
import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepo extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByCategory(Category category);

    List<Product> findByStatus(Status status);

    List<Product> findByCategoryAndStatus(Category category, Status status);

    List<Product> findByNameContainingIgnoreCase(String keyword);

    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);

    List<Product> findByStockQuantityGreaterThan(Integer quantity);

    long countByCategory(Category category);

    long countByStatus(Status status);

    boolean existsByNameIgnoreCase(String name);

    Optional<Product> findBySku(String sku);

    boolean existsBySku(String sku);

    List<Product> findByDiscountedPriceIsNotNull();

    List<Product> findByCategoryAndStatusAndStockQuantityGreaterThan(Category category, Status status, Integer quantity);
}