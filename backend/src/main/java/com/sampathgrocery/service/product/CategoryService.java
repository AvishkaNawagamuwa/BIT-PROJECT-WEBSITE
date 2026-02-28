package com.sampathgrocery.service.product;

import com.sampathgrocery.dto.product.CategoryRequest;
import com.sampathgrocery.dto.product.CategoryResponse;
import com.sampathgrocery.entity.product.Category;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.product.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getAllCategories(Boolean active) {
        List<Category> categories = active != null && active
                ? categoryRepository.findByIsActiveTrue()
                : categoryRepository.findAll();

        return categories.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getRootCategories() {
        return categoryRepository.findByParentCategoryIsNullAndIsActiveTrue()
                .stream()
                .map(this::toResponseWithSubcategories)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(Integer id) {
        Category category = findById(id);
        return toResponse(category);
    }

    public CategoryResponse createCategory(CategoryRequest request, Integer createdBy) {
        // Check uniqueness
        if (categoryRepository.existsByCategoryNameIgnoreCase(request.getCategoryName())) {
            throw new BadRequestException("Category name already exists");
        }

        Category category = new Category();
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setIsActive(request.getIsActive());
        category.setCreatedBy(createdBy);
        category.setUpdatedBy(createdBy);

        if (request.getParentCategoryId() != null) {
            Category parent = findById(request.getParentCategoryId());
            category.setParentCategory(parent);
        }

        category = categoryRepository.save(category);
        return toResponse(category);
    }

    public CategoryResponse updateCategory(Integer id, CategoryRequest request, Integer updatedBy) {
        Category category = findById(id);

        // Check uniqueness (excluding current)
        Category existing = categoryRepository.findByCategoryNameIgnoreCase(request.getCategoryName()).orElse(null);
        if (existing != null && !existing.getCategoryId().equals(id)) {
            throw new BadRequestException("Category name already exists");
        }

        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setIsActive(request.getIsActive());
        category.setUpdatedBy(updatedBy);

        if (request.getParentCategoryId() != null) {
            Category parent = findById(request.getParentCategoryId());
            category.setParentCategory(parent);
        } else {
            category.setParentCategory(null);
        }

        category = categoryRepository.save(category);
        return toResponse(category);
    }

    public void deleteCategory(Integer id) {
        Category category = findById(id);
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    public List<CategoryResponse> searchCategories(String query) {
        return categoryRepository.searchByName(query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Helper methods
    private Category findById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setCategoryId(category.getCategoryId());
        response.setCategoryName(category.getCategoryName());
        response.setDescription(category.getDescription());
        response.setIsActive(category.getIsActive());
        response.setCreatedAt(category.getCreatedAt());

        if (category.getParentCategory() != null) {
            response.setParentCategoryId(category.getParentCategory().getCategoryId());
            response.setParentCategoryName(category.getParentCategory().getCategoryName());
        }

        return response;
    }

    private CategoryResponse toResponseWithSubcategories(Category category) {
        CategoryResponse response = toResponse(category);

        List<Category> subcategories = categoryRepository
                .findByParentCategoryCategoryIdAndIsActiveTrue(category.getCategoryId());

        if (!subcategories.isEmpty()) {
            response.setSubcategories(subcategories.stream()
                    .map(this::toResponseWithSubcategories)
                    .collect(Collectors.toList()));
        } else {
            response.setSubcategories(new ArrayList<>());
        }

        return response;
    }
}
