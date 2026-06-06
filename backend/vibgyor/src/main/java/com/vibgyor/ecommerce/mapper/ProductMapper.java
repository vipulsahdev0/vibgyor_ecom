package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.request.product.ProductImageRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductRequest;
import com.vibgyor.ecommerce.dto.request.product.ProductUpdateRequest;
import com.vibgyor.ecommerce.dto.response.product.ProductDetailResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductImageResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductResponse;
import com.vibgyor.ecommerce.dto.response.product.ProductSummaryResponse;
import com.vibgyor.ecommerce.entity.Category;
import com.vibgyor.ecommerce.entity.Product;
import com.vibgyor.ecommerce.entity.ProductImage;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class ProductMapper {

    private ProductMapper() {
    }

    public static Product toEntity(ProductRequest request, Category category) {
        if (request == null) {
            return null;
        }

        return Product.builder()
                .name(request.getName() != null ? request.getName().trim() : null)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .price(request.getPrice())
                .discountedPrice(request.getDiscountedPrice())
                .sku(normalizeSku(request.getSku()))
                .stockQuantity(request.getStockQuantity())
                .status(request.getStatus())
                .category(category)
                .build();
    }

    public static void updateEntity(Product product, ProductUpdateRequest request, Category category) {
        if (product == null || request == null) {
            return;
        }

        product.setName(request.getName() != null ? request.getName().trim() : null);
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setPrice(request.getPrice());
        product.setDiscountedPrice(request.getDiscountedPrice());
        product.setSku(normalizeSku(request.getSku()));
        product.setStockQuantity(request.getStockQuantity());
        product.setStatus(request.getStatus());
        product.setCategory(category);
    }

    private static String normalizeSku(String sku) {
        return (sku == null || sku.trim().isEmpty()) ? null : sku.trim();
    }

    public static ProductImage toProductImageEntity(ProductImageRequest request, Product product) {
        if (request == null) {
            return null;
        }

        return ProductImage.builder()
                .imageUrl(request.getImageUrl())
                .isPrimary(Boolean.TRUE.equals(request.getIsPrimary()))
                .displayOrder(request.getDisplayOrder())
                .product(product)
                .build();
    }

    public static ProductImageResponse toImageResponse(ProductImage image) {
        if (image == null) {
            return null;
        }

        return ProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .build();
    }

    public static List<ProductImageResponse> toImageResponseList(List<ProductImage> images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }

        return images.stream()
                .sorted(Comparator.comparing(
                        ProductImage::getDisplayOrder,
                        Comparator.nullsLast(Integer::compareTo)
                ))
                .map(ProductMapper::toImageResponse)
                .toList();
    }

    public static ProductResponse toResponse(Product product, List<ProductImage> images) {
        if (product == null) {
            return null;
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountedPrice(product.getDiscountedPrice())
                .finalPrice(calculateFinalPrice(product))
                .sku(product.getSku())
                .stockQuantity(product.getStockQuantity())
                .status(product.getStatus())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .primaryImageUrl(extractPrimaryImageUrl(images))
                .images(toImageResponseList(images))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public static ProductSummaryResponse toSummaryResponse(Product product, List<ProductImage> images) {
        if (product == null) {
            return null;
        }

        return ProductSummaryResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .price(product.getPrice())
                .discountedPrice(product.getDiscountedPrice())
                .finalPrice(calculateFinalPrice(product))
                .primaryImageUrl(extractPrimaryImageUrl(images))
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .stockQuantity(product.getStockQuantity())
                .build();
    }

    public static ProductDetailResponse toDetailResponse(Product product, List<ProductImage> images) {
        if (product == null) {
            return null;
        }

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountedPrice(product.getDiscountedPrice())
                .finalPrice(calculateFinalPrice(product))
                .sku(product.getSku())
                .stockQuantity(product.getStockQuantity())
                .status(product.getStatus())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .images(toImageResponseList(images))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private static BigDecimal calculateFinalPrice(Product product) {
        if (product.getDiscountedPrice() != null
                && product.getDiscountedPrice().compareTo(BigDecimal.ZERO) > 0) {
            return product.getDiscountedPrice();
        }
        return product.getPrice();
    }

    private static String extractPrimaryImageUrl(List<ProductImage> images) {
        if (images == null || images.isEmpty()) {
            return null;
        }

        return images.stream()
                .filter(image -> Boolean.TRUE.equals(image.getIsPrimary()))
                .findFirst()
                .or(() -> images.stream()
                        .sorted(Comparator.comparing(
                                ProductImage::getDisplayOrder,
                                Comparator.nullsLast(Integer::compareTo)
                        ))
                        .findFirst())
                .map(ProductImage::getImageUrl)
                .orElse(null);
    }
}