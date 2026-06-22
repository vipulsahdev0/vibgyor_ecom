package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.common.ApiResponse;
import com.vibgyor.ecommerce.dto.request.product.ProductFilterRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductUpdateRequest;
import com.vibgyor.ecommerce.dto.response.product.ProductDetailResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductSummaryResponse;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Product created successfully",
                        productService.createProduct(request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Product updated successfully",
                productService.updateProduct(id, request)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductStatus(
            @PathVariable Long id,
            @RequestParam Status status) {
        return ResponseEntity.ok(ApiResponse.ok("Product status updated successfully",
                productService.updateProductStatus(id, status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductById(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Product fetched successfully",
                productService.getProductById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductSummaryResponse>>> getProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock) {

        boolean hasFilter = categoryId != null || status != null
                || (keyword != null && !keyword.isBlank())
                || minPrice != null || maxPrice != null || inStock != null;

        if (!hasFilter) {
            return ResponseEntity.ok(ApiResponse.ok("Products fetched successfully",
                    productService.getAllProducts()));
        }

        if (categoryId != null && status == null && keyword == null
                && minPrice == null && maxPrice == null && inStock == null) {
            return ResponseEntity.ok(ApiResponse.ok("Products fetched successfully",
                    productService.getProductsByCategory(categoryId)));
        }

        ProductFilterRequest filterRequest = ProductFilterRequest.builder()
                .categoryId(categoryId).status(status).keyword(keyword)
                .minPrice(minPrice).maxPrice(maxPrice).inStock(inStock)
                .build();
        return ResponseEntity.ok(ApiResponse.ok("Products fetched successfully",
                productService.getProductsByFilter(filterRequest)));
    }
}