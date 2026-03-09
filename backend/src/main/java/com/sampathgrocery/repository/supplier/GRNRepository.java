package com.sampathgrocery.repository.supplier;

import com.sampathgrocery.entity.supplier.GRN;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * GRN Repository
 * Handles database operations for Goods Received Notes
 */
@Repository
public interface GRNRepository extends JpaRepository<GRN, Integer> {

        /**
         * Find GRN by GRN number
         */
        Optional<GRN> findByGrnNumber(String grnNumber);

        /**
         * Find GRNs by supplier
         */
        List<GRN> findBySupplierSupplierId(Integer supplierId);

        /**
         * Find GRNs by status
         */
        List<GRN> findByStatus(GRN.GRNStatus status);

        /**
         * Find GRN by purchase order
         */
        List<GRN> findByPurchaseOrderRequestId(Integer requestId);

        /**
         * Search GRNs with filters
         */
        @Query("SELECT g FROM GRN g WHERE " +
                        "(:query IS NULL OR LOWER(g.grnNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "OR LOWER(g.invoiceNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
                        "OR LOWER(g.supplier.supplierName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
                        "AND (:supplierId IS NULL OR g.supplier.supplierId = :supplierId) " +
                        "AND (:status IS NULL OR g.status = :status) " +
                        "AND (:fromDate IS NULL OR g.receivedDate >= :fromDate) " +
                        "AND (:toDate IS NULL OR g.receivedDate <= :toDate) " +
                        "ORDER BY g.receivedDate DESC")
        List<GRN> searchGRNs(
                        @Param("query") String query,
                        @Param("supplierId") Integer supplierId,
                        @Param("status") GRN.GRNStatus status,
                        @Param("fromDate") LocalDate fromDate,
                        @Param("toDate") LocalDate toDate);

        /**
         * Get total purchase value by date range
         */
        @Query("SELECT COALESCE(SUM(g.grandTotal), 0) FROM GRN g WHERE " +
                        "g.status = 'APPROVED' " +
                        "AND g.receivedDate >= :fromDate " +
                        "AND g.receivedDate <= :toDate")
        Double getTotalPurchaseValue(
                        @Param("fromDate") LocalDate fromDate,
                        @Param("toDate") LocalDate toDate);

        /**
         * Get the last GRN number for auto-generation
         */
        @Query("SELECT g.grnNumber FROM GRN g ORDER BY g.grnId DESC LIMIT 1")
        Optional<String> findLastGrnNumber();

        /**
         * Count GRNs with quality issues
         */
        @Query("SELECT COUNT(g) FROM GRN g WHERE g.qualityStatus = 'ISSUES' AND g.status = 'APPROVED'")
        Long countGRNsWithIssues();

        /**
         * Count GRNs received in a date range
         */
        @Query("SELECT COUNT(g) FROM GRN g WHERE " +
                        "g.receivedDate >= :fromDate AND g.receivedDate <= :toDate " +
                        "AND g.status = 'APPROVED'")
        Long countGRNsInDateRange(
                        @Param("fromDate") LocalDate fromDate,
                        @Param("toDate") LocalDate toDate);

        /**
         * Get total GRN value (approved only)
         */
        @Query("SELECT COALESCE(SUM(g.grandTotal), 0) FROM GRN g WHERE g.status = 'APPROVED'")
        java.math.BigDecimal getTotalGRNValue();

        /**
         * Count all approved GRNs
         */
        Long countByStatus(GRN.GRNStatus status);
}
