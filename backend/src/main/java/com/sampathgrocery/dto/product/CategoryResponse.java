package com.sampathgrocery.dto.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Category Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Integer categoryId;
    private String categoryName;
    private String description;
    private Integer parentCategoryId;
    private String parentCategoryName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Integer productCount;
    private List<CategoryResponse> subcategories;
}
