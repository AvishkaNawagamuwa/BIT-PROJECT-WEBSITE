package com.sampathgrocery.repository.product;

import com.sampathgrocery.entity.product.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Stock Alert Repository
 * Handles database operations for Stock Alerts
 */
@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, Integer> {

    /**
     * Find unresolved alerts
     */
    List<StockAlert> findByIsResolvedFalseOrderByCreatedAtDesc();

    /**
     * Find alerts by type
     */
    List<StockAlert> findByAlertTypeAndIsResolvedFalse(StockAlert.AlertType alertType);

    /**
     * Find alerts by severity
     */
    List<StockAlert> findBySeverityAndIsResolvedFalseOrderByCreatedAtDesc(StockAlert.Severity severity);

    /**
     * Find alerts for a product
     */
    List<StockAlert> findByProductProductIdOrderByCreatedAtDesc(Integer productId);

    /**
     * Find unresolved alerts for a product
     */
    List<StockAlert> findByProductProductIdAndIsResolvedFalse(Integer productId);

    /**
     * Find alerts for a batch
     */
    List<StockAlert> findByBatchBatchIdAndIsResolvedFalse(Integer batchId);

    /**
     * Count unresolved alerts
     */
    Long countByIsResolvedFalse();

    /**
     * Count unresolved LOW_STOCK alerts
     */
    @Query("SELECT COUNT(a) FROM StockAlert a WHERE " +
            "a.alertType = 'LOW_STOCK' " +
            "AND a.isResolved = false")
    Long countUnresolvedLowStockAlerts();

    /**
     * Search alerts with filters
     */
    @Query("SELECT a FROM StockAlert a WHERE " +
            "(:type IS NULL OR a.alertType = :type) " +
            "AND (:isResolved IS NULL OR a.isResolved = :isResolved) " +
            "AND (:severity IS NULL OR a.severity = :severity) " +
            "ORDER BY a.createdAt DESC")
    List<StockAlert> searchAlerts(
            @Param("type") StockAlert.AlertType type,
            @Param("isResolved") Boolean isResolved,
            @Param("severity") StockAlert.Severity severity);

    /**
     * Find existing alert for product and type (to avoid duplicates)
     */
    @Query("SELECT a FROM StockAlert a WHERE " +
            "a.product.productId = :productId " +
            "AND a.alertType = :alertType " +
            "AND a.isResolved = false")
    List<StockAlert> findExistingAlert(
            @Param("productId") Integer productId,
            @Param("alertType") StockAlert.AlertType alertType);

    /**
     * Find existing alert for batch and type
     */
    @Query("SELECT a FROM StockAlert a WHERE " +
            "a.batch.batchId = :batchId " +
            "AND a.alertType = :alertType " +
            "AND a.isResolved = false")
    List<StockAlert> findExistingAlertForBatch(
            @Param("batchId") Integer batchId,
            @Param("alertType") StockAlert.AlertType alertType);
}
