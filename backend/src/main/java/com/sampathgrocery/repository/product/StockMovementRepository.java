package com.sampathgrocery.repository.product;

import com.sampathgrocery.entity.product.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Stock Movement Repository
 * Handles database operations for Stock Movements (audit trail)
 */
@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Integer> {

    /**
     * Find all movements for a batch
     */
    List<StockMovement> findByBatchBatchIdOrderByCreatedAtDesc(Integer batchId);

    /**
     * Find movements by type
     */
    List<StockMovement> findByMovementTypeOrderByCreatedAtDesc(StockMovement.MovementType movementType);

    /**
     * Find movements for a product (through batches)
     */
    @Query("SELECT sm FROM StockMovement sm WHERE " +
            "sm.batch.product.productId = :productId " +
            "ORDER BY sm.createdAt DESC")
    List<StockMovement> findByProductId(@Param("productId") Integer productId);

    /**
     * Find movements by reference number
     */
    List<StockMovement> findByReferenceNumber(String referenceNumber);

    /**
     * Find movements within date range
     */
    @Query("SELECT sm FROM StockMovement sm WHERE " +
            "sm.createdAt >= :fromDate " +
            "AND sm.createdAt <= :toDate " +
            "ORDER BY sm.createdAt DESC")
    List<StockMovement> findByDateRange(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    /**
     * Find recent movements (last N records)
     */
    @Query("SELECT sm FROM StockMovement sm ORDER BY sm.createdAt DESC LIMIT :limit")
    List<StockMovement> findRecentMovements(@Param("limit") int limit);
}
