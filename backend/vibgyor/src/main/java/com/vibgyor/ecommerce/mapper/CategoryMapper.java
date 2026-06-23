package com.vibgyor.ecommerce.mapper;

import com.vibgyor.ecommerce.dto.request.category.CategoryRequest;
import com.vibgyor.ecommerce.dto.response.category.CategoryResponse;
import com.vibgyor.ecommerce.dto.response.category.CategoryStatusResponse;
import com.vibgyor.ecommerce.dto.response.category.CategorySummaryResponse;
import com.vibgyor.ecommerce.entity.Category;
import com.vibgyor.ecommerce.entity.enums.Status;

public class CategoryMapper {

    private CategoryMapper() {
    }

    public static Category toEntity(CategoryRequest request) {
        if (request == null) {
            return null;
        }

        return Category.builder()
                .name(normalizeRequired(request.getName()))
                .description(normalizeOptional(request.getDescription()))
                .imageUrl(normalizeOptional(request.getImageUrl()))
                .status(Status.ACTIVE)
                .build();
    }

    public static void updateEntity(Category category, CategoryRequest request) {
        if (category == null || request == null) {
            return;
        }

        category.setName(normalizeRequired(request.getName()));
        category.setDescription(normalizeOptional(request.getDescription()));
        category.setImageUrl(normalizeOptional(request.getImageUrl()));
    }

    public static CategoryResponse toResponse(Category category) {
        if (category == null) {
            return null;
        }

        long productCount = category.getProducts() != null ? category.getProducts().size() : 0;

        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .status(category.getStatus())
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    public static CategorySummaryResponse toSummaryResponse(Category category) {
        if (category == null) {
            return null;
        }

        long productCount = category.getProducts() != null ? category.getProducts().size() : 0;

        return CategorySummaryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .status(category.getStatus())
                .productCount(productCount)
                .build();
    }

    public static CategoryStatusResponse toStatusResponse(Category category, String message) {
        if (category == null) {
            return null;
        }

        return CategoryStatusResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .status(category.getStatus())
                .message(message)
                .build();
    }

    private static String normalizeRequired(String value) {
        return value == null ? null : value.trim();
    }

    private static String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}