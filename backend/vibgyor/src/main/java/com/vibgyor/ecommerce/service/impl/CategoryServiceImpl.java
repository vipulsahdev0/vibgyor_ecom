package com.vibgyor.ecommerce.service.impl;

import com.vibgyor.ecommerce.dto.request.category.CategoryRequest;
import com.vibgyor.ecommerce.dto.request.category.CategoryStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.request.category.CategoryUpdateRequest;
import com.vibgyor.ecommerce.dto.response.category.CategoryResponse;
import com.vibgyor.ecommerce.dto.response.category.CategoryStatusResponse;
import com.vibgyor.ecommerce.dto.response.category.CategorySummaryResponse;
import com.vibgyor.ecommerce.entity.Category;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.exception.DuplicateResourceException;
import com.vibgyor.ecommerce.exception.ResourceNotFoundException;
import com.vibgyor.ecommerce.mapper.CategoryMapper;
import com.vibgyor.ecommerce.repository.CategoryRepo;
import com.vibgyor.ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepo categoryRepo;

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepo.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateResourceException("Another category already exists with name: " + request.getName());
        }

        Category category = CategoryMapper.toEntity(request);
        Category savedCategory = categoryRepo.save(category);
        return CategoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = findCategoryById(id);
        return CategoryMapper.toResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategorySummaryResponse> getAllCategories() {
        return categoryRepo.findAll()
                .stream()
                .map(CategoryMapper::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategorySummaryResponse> getCategoriesByStatus(Status status) {
        return categoryRepo.findByStatus(status)
                .stream()
                .map(CategoryMapper::toSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategorySummaryResponse> searchCategories(String keyword) {
        return categoryRepo.findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(CategoryMapper::toSummaryResponse)
                .toList();
    }

    @Override
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = findCategoryById(id);

        categoryRepo.findByNameIgnoreCase(request.getName())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new RuntimeException("Another category already exists with name: " + request.getName());
                });

        CategoryMapper.updateEntity(category, request);
        Category updatedCategory = categoryRepo.save(category);
        return CategoryMapper.toResponse(updatedCategory);
    }

    @Override
    public CategoryStatusResponse updateCategoryStatus(Long id, CategoryStatusUpdateRequest request) {
        Category category = findCategoryById(id);
        category.setStatus(request.getStatus());

        Category updatedCategory = categoryRepo.save(category);
        String message = request.getStatus() == Status.ACTIVE
                ? "Category activated successfully"
                : "Category deactivated successfully";

        return CategoryMapper.toStatusResponse(updatedCategory, message);
    }

    private Category findCategoryById(Long id) {
        return categoryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
}