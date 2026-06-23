package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.product.ProductFilterRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductImageRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductUpdateRequest;
import com.vibgyor.ecommerce.dto.response.product.ProductDetailResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductSummaryResponse;
import com.vibgyor.ecommerce.entity.Category;
import com.vibgyor.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.vibgyor.ecommerce.entity.ProductImage;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.exception.ResourceNotFoundException;
import com.vibgyor.ecommerce.mapper.ProductMapper;
import com.vibgyor.ecommerce.repository.CategoryRepo;
import com.vibgyor.ecommerce.repository.ProductImageRepo;
import com.vibgyor.ecommerce.repository.ProductRepo;
import com.vibgyor.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepo productRepo;
    private final CategoryRepo categoryRepo;
    private final ProductImageRepo productImageRepo;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        validateProductRequest(request);
        validateCreateConstraints(request);

        Category category = findCategoryById(request.getCategoryId());
        Product product = ProductMapper.toEntity(request, category);
        Product savedProduct = productRepo.save(product);

        saveProductImages(savedProduct, request.getImages());
        List<ProductImage> savedImages = productImageRepo.findByProductOrderByDisplayOrderAsc(savedProduct);

        return ProductMapper.toResponse(savedProduct, savedImages);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        validateProductRequestForUpdate(request);

        Product product = findProductById(id);
        Category category = findCategoryById(request.getCategoryId());

        validateUpdateConstraints(id, request);

        ProductMapper.updateEntity(product, request, category);
        Product updatedProduct = productRepo.save(product);

        productImageRepo.findByProduct(updatedProduct)
                .forEach(productImageRepo::delete);

        saveProductImages(updatedProduct, request.getImages());
        List<ProductImage> savedImages = productImageRepo.findByProductOrderByDisplayOrderAsc(updatedProduct);

        return ProductMapper.toResponse(updatedProduct, savedImages);
    }

    @Override
    public ProductResponse updateProductStatus(Long id, Status status) {
        Product product = findProductById(id);
        product.setStatus(status);
        Product updated = productRepo.save(product);
        List<ProductImage> images = productImageRepo.findByProductOrderByDisplayOrderAsc(updated);
        return ProductMapper.toResponse(updated, images);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductById(Long id) {
        Product product = findProductById(id);
        List<ProductImage> images = productImageRepo.findByProductOrderByDisplayOrderAsc(product);
        return ProductMapper.toDetailResponse(product, images);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductSummaryResponse> getProductsByFilter(ProductFilterRequest filterRequest, Pageable pageable) {
        Page<Product> productPage = productRepo.findAll(pageable);

        // Apply filters in memory
        List<ProductSummaryResponse> filtered = productPage.getContent().stream()
                .filter(product -> matchesKeyword(product, filterRequest))
                .filter(product -> matchesPriceRange(product, filterRequest))
                .filter(product -> matchesStockFilter(product, filterRequest))
                .map(product -> ProductMapper.toSummaryResponse(
                        product,
                        productImageRepo.findByProductOrderByDisplayOrderAsc(product)
                ))
                .toList();

        return new org.springframework.data.domain.PageImpl<>(
                filtered,
                pageable,
                productPage.getTotalElements()
        );
    }

    // ── Validation helpers ────────────────────────────────────────────────

    private void validateProductRequest(ProductRequest request) {
        if (request.getDiscountedPrice() != null
                && request.getDiscountedPrice().compareTo(request.getPrice()) > 0) {
            throw new IllegalArgumentException("Discounted price cannot be greater than actual price");
        }
    }

    private void validateProductRequestForUpdate(ProductUpdateRequest request) {
        if (request.getDiscountedPrice() != null
                && request.getDiscountedPrice().compareTo(request.getPrice()) > 0) {
            throw new IllegalArgumentException("Discounted price cannot be greater than actual price");
        }
    }

    private void validateCreateConstraints(ProductRequest request) {
        if (productRepo.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Product already exists with name: " + request.getName());
        }

        if (request.getSku() != null && !request.getSku().isBlank()
                && productRepo.existsBySku(request.getSku())) {
            throw new IllegalArgumentException("Product already exists with SKU: " + request.getSku());
        }
    }

    private void validateUpdateConstraints(Long id, ProductUpdateRequest request) {
        List<Product> sameNameProducts = productRepo.findByNameContainingIgnoreCase(request.getName());

        boolean duplicateName = sameNameProducts.stream()
                .anyMatch(product ->
                        product.getName() != null
                                && product.getName().equalsIgnoreCase(request.getName())
                                && !product.getId().equals(id));

        if (duplicateName) {
            throw new IllegalArgumentException(
                    "Another product already exists with name: " + request.getName());
        }

        if (request.getSku() != null && !request.getSku().isBlank()) {
            productRepo.findBySku(request.getSku())
                    .filter(existing -> !existing.getId().equals(id))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException(
                                "Another product already exists with SKU: " + request.getSku());
                    });
        }
    }

    // ── Lookup helpers ────────────────────────────────────────────────────

    private Category findCategoryById(Long categoryId) {
        return categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + categoryId));
    }

    private Product findProductById(Long id) {
        return productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));
    }

    // ── Image helper ──────────────────────────────────────────────────────

    private void saveProductImages(Product product, List<ProductImageRequest> imageRequests) {
        if (imageRequests == null || imageRequests.isEmpty()) {
            return;
        }

        boolean hasPrimary = imageRequests.stream()
                .anyMatch(image -> Boolean.TRUE.equals(image.getIsPrimary()));

        for (int i = 0; i < imageRequests.size(); i++) {
            ProductImageRequest request = imageRequests.get(i);
            ProductImage image = ProductMapper.toProductImageEntity(request, product);

            if (!hasPrimary && i == 0) {
                image.setIsPrimary(true);
            }

            if (image.getDisplayOrder() == null) {
                image.setDisplayOrder(i + 1);
            }

            productImageRepo.save(image);
        }
    }

    // ── Filter helpers ────────────────────────────────────────────────────

    private List<Product> resolveProductsByBaseFilter(ProductFilterRequest filterRequest) {
        if (filterRequest == null) {
            return productRepo.findAll();
        }

        if (filterRequest.getCategoryId() != null && filterRequest.getStatus() != null) {
            Category category = findCategoryById(filterRequest.getCategoryId());
            if (Boolean.TRUE.equals(filterRequest.getInStock())) {
                return productRepo.findByCategoryAndStatusAndStockQuantityGreaterThan(
                        category,
                        filterRequest.getStatus(),
                        0);
            }
            return productRepo.findByCategoryAndStatus(category, filterRequest.getStatus());
        }

        if (filterRequest.getCategoryId() != null) {
            return productRepo.findByCategoryId(filterRequest.getCategoryId());
        }

        if (filterRequest.getStatus() != null) {
            return productRepo.findByStatus(filterRequest.getStatus());
        }

        if (filterRequest.getKeyword() != null && !filterRequest.getKeyword().isBlank()) {
            return productRepo.findByNameContainingIgnoreCase(filterRequest.getKeyword());
        }

        if (filterRequest.getMinPrice() != null && filterRequest.getMaxPrice() != null) {
            return productRepo.findByPriceBetween(
                    filterRequest.getMinPrice(), filterRequest.getMaxPrice());
        }

        if (Boolean.TRUE.equals(filterRequest.getInStock())) {
            return productRepo.findByStockQuantityGreaterThan(0);
        }

        return productRepo.findAll();
    }

    private boolean matchesKeyword(Product product, ProductFilterRequest filterRequest) {
        if (filterRequest == null
                || filterRequest.getKeyword() == null
                || filterRequest.getKeyword().isBlank()) {
            return true;
        }
        return product.getName() != null
                && product.getName().toLowerCase()
                .contains(filterRequest.getKeyword().toLowerCase());
    }

    private boolean matchesPriceRange(Product product, ProductFilterRequest filterRequest) {
        if (filterRequest == null) {
            return true;
        }

        BigDecimal finalPrice = product.getDiscountedPrice() != null
                ? product.getDiscountedPrice()
                : product.getPrice();

        if (filterRequest.getMinPrice() != null
                && finalPrice.compareTo(filterRequest.getMinPrice()) < 0) {
            return false;
        }

        if (filterRequest.getMaxPrice() != null
                && finalPrice.compareTo(filterRequest.getMaxPrice()) > 0) {
            return false;
        }

        return true;
    }

    private boolean matchesStockFilter(Product product, ProductFilterRequest filterRequest) {
        if (filterRequest == null || filterRequest.getInStock() == null) {
            return true;
        }

        if (Boolean.TRUE.equals(filterRequest.getInStock())) {
            return product.getStockQuantity() != null && product.getStockQuantity() > 0;
        }

        return true;
    }
}