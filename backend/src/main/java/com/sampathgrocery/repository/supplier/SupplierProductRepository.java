package com.sampathgrocery.repository.supplier;

import com.sampathgrocery.entity.supplier.SupplierProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * සප්ලායර්-නිෂ්පාදන Repository
 * Supplier-Product Relationship Repository
 */
@Repository
public interface SupplierProductRepository extends JpaRepository<SupplierProduct, Long> {

    /**
     * Find all products for a specific supplier
     */
    @Query("SELECT sp FROM SupplierProduct sp WHERE sp.supplier.supplierId = :supplierId AND sp.status = 'ACTIVE'")
    List<SupplierProduct> findBySupplierIdAndActive(@Param("supplierId") Integer supplierId);

    /**
     * Find all suppliers for a specific product
     */
    @Query("SELECT sp FROM SupplierProduct sp WHERE sp.product.productId = :productId AND sp.status = 'ACTIVE'")
    List<SupplierProduct> findByProductIdAndActive(@Param("productId") Integer productId);

    /**
     * Find specific supplier-product relationship
     */
    @Query("SELECT sp FROM SupplierProduct sp WHERE sp.supplier.supplierId = :supplierId AND sp.product.productId = :productId")
    Optional<SupplierProduct> findBySupplierIdAndProductId(@Param("supplierId") Integer supplierId,
            @Param("productId") Integer productId);

    /**
     * Find primary supplier for a product
     */
    @Query("SELECT sp FROM SupplierProduct sp WHERE sp.product.productId = :productId AND sp.isPrimarySupplier = true AND sp.status = 'ACTIVE'")
    Optional<SupplierProduct> findPrimarySupplierForProduct(@Param("productId") Integer productId);

    /**
     * Count products for a supplier
     */
    @Query("SELECT COUNT(sp) FROM SupplierProduct sp WHERE sp.supplier.supplierId = :supplierId AND sp.status = 'ACTIVE'")
    Long countProductsBySupplier(@Param("supplierId") Integer supplierId);

    /**
     * Count suppliers for a product
     */
    @Query("SELECT COUNT(sp) FROM SupplierProduct sp WHERE sp.product.productId = :productId AND sp.status = 'ACTIVE'")
    Long countSuppliersByProduct(@Param("productId") Integer productId);

    /**
     * Delete all products for a supplier
     */
    @Query("DELETE FROM SupplierProduct sp WHERE sp.supplier.supplierId = :supplierId")
    void deleteBySupplier(@Param("supplierId") Integer supplierId);

    /**
     * Delete specific supplier-product relationship
     */
    @Query("DELETE FROM SupplierProduct sp WHERE sp.supplier.supplierId = :supplierId AND sp.product.productId = :productId")
    void deleteBySupplierAndProduct(@Param("supplierId") Integer supplierId, @Param("productId") Integer productId);
}
