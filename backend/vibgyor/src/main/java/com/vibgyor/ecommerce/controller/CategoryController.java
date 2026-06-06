package com.vibgyor.ecommerce.controller;

import com.vibgyor.ecommerce.dto.request.category.CategoryRequest;
import com.vibgyor.ecommerce.dto.request.category.CategoryStatusUpdateRequest;
import com.vibgyor.ecommerce.dto.request.category.CategoryUpdateRequest;
import com.vibgyor.ecommerce.dto.response.category.CategoryResponse;
import com.vibgyor.ecommerce.dto.response.category.CategoryStatusResponse;
import com.vibgyor.ecommerce.dto.response.category.CategorySummaryResponse;
import com.vibgyor.ecommerce.entity.enums.Status;
import com.vibgyor.ecommerce.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.createCategory(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @GetMapping
    public ResponseEntity<List<CategorySummaryResponse>> getAllCategories(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) String keyword
    ) {
        if (status != null) {
            return ResponseEntity.ok(categoryService.getCategoriesByStatus(status));
        }
        if (keyword != null && !keyword.isBlank()) {
            return ResponseEntity.ok(categoryService.searchCategories(keyword));
        }
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CategoryStatusResponse> updateCategoryStatus(
            @PathVariable Long id,
            @Valid @RequestBody CategoryStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(categoryService.updateCategoryStatus(id, request));
    }
}