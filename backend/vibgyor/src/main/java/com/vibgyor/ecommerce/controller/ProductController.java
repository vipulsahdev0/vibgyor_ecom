package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.request.product.ProductFilterRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductUpdateRequest;
import com.vibgyor.ecommerce.dto.response.product.ProductDetailResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductSummaryResponse;
import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.ProductImage;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.mapper.ProductMapper;
import com.vibgyor.ecommerce.repository.ProductImageRepo;
import com.vibgyor.ecommerce.repository.ProductRepo;
import com.vibgyor.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductRepo productRepo;
    private final ProductImageRepo productImageRepo;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request
    ) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductResponse> updateProductStatus(
            @PathVariable Long id,
            @RequestParam Status status) {

        Product product = productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setStatus(status);
        Product updated = productRepo.save(product);

        List<ProductImage> images = productImageRepo.findByProductOrderByDisplayOrderAsc(updated);
        return ResponseEntity.ok(ProductMapper.toResponse(updated, images));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping
    public ResponseEntity<List<ProductSummaryResponse>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock
    ) {
        boolean hasFilter = categoryId != null || status != null || (keyword != null && !keyword.isBlank())
                || minPrice != null || maxPrice != null || inStock != null;

        if (!hasFilter) {
            return ResponseEntity.ok(productService.getAllProducts());
        }

        if (categoryId != null && status == null && keyword == null && minPrice == null && maxPrice == null && inStock == null) {
            return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
        }

        ProductFilterRequest filterRequest = ProductFilterRequest.builder()
                .categoryId(categoryId)
                .status(status)
                .keyword(keyword)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .inStock(inStock)
                .build();

        return ResponseEntity.ok(productService.getProductsByFilter(filterRequest));
    }

}