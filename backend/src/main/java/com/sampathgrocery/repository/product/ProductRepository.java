package com.sampathgrocery.repository.product;

import com.sampathgrocery.entity.product.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Product Repository
 * Handles database operations for Products
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Integer> {

        /**
         * Find product by code
         */
        Optional<Product> findByProductCode(String productCode);

        /**
         * Find product by barcode
         */
        Optional<Product> findByBarcode(String barcode);

        /**
         * Find all active products
         */
        List<Product> findByIsActiveTrue();

        /**
         * Find products by category
         */
        List<Product> findByCategoryCategoryIdAndIsActiveTrue(Integer categoryId);

        /**
         * Check if product code exists
         */
        boolean existsByProductCode(String productCode);

        /**
         * Check if barcode exists
         */
        boolean existsByBarcode(String barcode);

        /**
         * Count products by brand
         */
        Long countByBrandBrandId(Integer brandId);

        /**
         * Count products by unit
         */
        Long countByUnitUnitId(Integer unitId);

        /**
         * Search products by name, code, brand, or barcode
         */
        @Query("SELECT p FROM Product p WHERE " +
                        "(LOWER(p.productName) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "OR LOWER(p.productCode) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%'))) " +
                        "AND p.isActive = true")
        List<Product> searchProducts(@Param("query") String query);

        /**
         * Find products by category and active status
         */
        @Query("SELECT p FROM Product p WHERE " +
                        "(:categoryId IS NULL OR p.category.categoryId = :categoryId) " +
                        "AND (:isActive IS NULL OR p.isActive = :isActive)")
        List<Product> findByCategoryAndStatus(
                        @Param("categoryId") Integer categoryId,
                        @Param("isActive") Boolean isActive);

        /**
         * Get the last product code for auto-generation
         */
        @Query("SELECT p.productCode FROM Product p ORDER BY p.productId DESC LIMIT 1")
        Optional<String> findLastProductCode();
}
