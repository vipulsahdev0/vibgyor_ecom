package com.vibgyor.ecommerce.service;

import com.vibgyor.ecommerce.dto.request.category.CategoryRequest;
import com.vibgyor.ecommerce.dto.request.category.CategoryStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.request.category.CategoryUpdateRequest;
import com.vibgyor.ecommerce.dto.response.category.CategoryResponse;
import com.vibgyor.ecommerce.dto.response.category.CategoryStatusResponse;
import com.vibgyor.ecommerce.dto.response.category.CategorySummaryResponse;
import com.vibgyor.ecommerce.entity.enums.Status;

import java.util.List;

public interface CategoryService {

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse getCategoryById(Long id);

    List<CategorySummaryResponse> getAllCategories();

    List<CategorySummaryResponse> getCategoriesByStatus(Status status);

    List<CategorySummaryResponse> searchCategories(String keyword);

    CategoryResponse updateCategory(Long id, CategoryUpdateRequest request);

    CategoryStatusResponse updateCategoryStatus(Long id, CategoryStatusUpdateRequest request);
}