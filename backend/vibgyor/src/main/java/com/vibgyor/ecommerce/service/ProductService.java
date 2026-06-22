package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.product.ProductFilterRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductUpdateRequest;
import com.vibgyor.ecommerce.dto.response.product.ProductDetailResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductSummaryResponse;
import com.vibgyor.ecommerce.entity.enums.Status;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductUpdateRequest request);

    ProductDetailResponse getProductById(Long id);

    List<ProductSummaryResponse> getAllProducts();

    List<ProductSummaryResponse> getProductsByCategory(Long categoryId);

    ProductResponse updateProductStatus(Long id, Status status);

    List<ProductSummaryResponse> getProductsByFilter(ProductFilterRequest filterRequest);
}