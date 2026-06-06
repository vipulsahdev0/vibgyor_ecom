package com.vibgyor.ecommerce.repository;

import com.vibgyor.ecommerce.entity.ProductImage;
import com.vibgyor.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductImageRepo extends JpaRepository<ProductImage, Long> {

    List<ProductImage> findByProduct(Product product);

    Optional<ProductImage> findByProductAndIsPrimaryTrue(Product product);

    List<ProductImage> findByProductOrderByDisplayOrderAsc(Product product);

}