package com.sampathgrocery.repository.product;

import com.sampathgrocery.entity.product.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Category Repository
 * Handles database operations for Categories
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {

    /**
     * Find category by name (case-insensitive)
     */
    Optional<Category> findByCategoryNameIgnoreCase(String name);

    /**
     * Find all active categories
     */
    List<Category> findByIsActiveTrue();

    /**
     * Find root categories (no parent)
     */
    List<Category> findByParentCategoryIsNullAndIsActiveTrue();

    /**
     * Find subcategories by parent ID
     */
    List<Category> findByParentCategoryCategoryIdAndIsActiveTrue(Integer parentId);

    /**
     * Check if category name exists (for uniqueness validation)
     */
    boolean existsByCategoryNameIgnoreCase(String name);

    /**
     * Search categories by name
     */
    @Query("SELECT c FROM Category c WHERE LOWER(c.categoryName) LIKE LOWER(CONCAT('%', :query, '%')) AND c.isActive = true")
    List<Category> searchByName(String query);
}
