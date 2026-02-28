package com.sampathgrocery.repository.supplier;

import com.sampathgrocery.entity.supplier.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Supplier Repository
 * Handles database operations for Suppliers
 */
@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {

    /**
     * Find supplier by code
     */
    Optional<Supplier> findBySupplierCode(String supplierCode);

    /**
     * Find all active suppliers
     */
    List<Supplier> findByIsActiveTrue();

    /**
     * Check if supplier code exists
     */
    boolean existsBySupplierCode(String supplierCode);

    /**
     * Search suppliers by name, code, contact person, phone, or email
     */
    @Query("SELECT s FROM Supplier s WHERE " +
            "(LOWER(s.supplierName) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(s.supplierCode) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(s.phone) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:isActive IS NULL OR s.isActive = :isActive)")
    List<Supplier> searchSuppliers(
            @Param("query") String query,
            @Param("isActive") Boolean isActive);

    /**
     * Get the last supplier code for auto-generation
     */
    @Query("SELECT s.supplierCode FROM Supplier s ORDER BY s.supplierId DESC LIMIT 1")
    Optional<String> findLastSupplierCode();
}
