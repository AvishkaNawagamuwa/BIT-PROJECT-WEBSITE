package com.sampathgrocery.repository.product;

import com.sampathgrocery.entity.product.ProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Product Batch Repository
 * Handles database operations for Product Batches
 */
@Repository
public interface ProductBatchRepository extends JpaRepository<ProductBatch, Integer> {

       /**
        * Find batch by batch code
        */
       Optional<ProductBatch> findByBatchCode(String batchCode);

       /**
        * Find all batches for a product
        */
       List<ProductBatch> findByProductProductId(Integer productId);

       /**
        * Find active batches for a product (FIFO - ordered by expiry date)
        */
       @Query("SELECT b FROM ProductBatch b WHERE " +
                     "b.product.productId = :productId " +
                     "AND b.isActive = true " +
                     "AND b.stockQuantity > 0 " +
                     "ORDER BY b.expiryDate ASC, b.receivedDate ASC")
       List<ProductBatch> findActiveByProductOrderByExpiryDate(@Param("productId") Integer productId);

       /**
        * Find batches expiring soon (within days)
        */
       @Query("SELECT b FROM ProductBatch b WHERE " +
                     "b.isActive = true " +
                     "AND b.stockQuantity > 0 " +
                     "AND b.expiryDate IS NOT NULL " +
                     "AND b.expiryDate BETWEEN :today AND :expiryDate " +
                     "ORDER BY b.expiryDate ASC")
       List<ProductBatch> findBatchesExpiringSoon(
                     @Param("today") LocalDate today,
                     @Param("expiryDate") LocalDate expiryDate);

       /**
        * Find expired batches
        */
       @Query("SELECT b FROM ProductBatch b WHERE " +
                     "b.isActive = true " +
                     "AND b.stockQuantity > 0 " +
                     "AND b.expiryDate IS NOT NULL " +
                     "AND b.expiryDate < :today")
       List<ProductBatch> findExpiredBatches(@Param("today") LocalDate today);

       /**
        * Get total stock quantity for a product (across all batches)
        */
       @Query("SELECT COALESCE(SUM(b.stockQuantity), 0) FROM ProductBatch b WHERE " +
                     "b.product.productId = :productId " +
                     "AND b.isActive = true")
       Integer getTotalStockByProduct(@Param("productId") Integer productId);

       /**
        * Find batches by supplier
        */
       List<ProductBatch> findBySupplierSupplierId(Integer supplierId);

       /**
        * Search batches with filters
        */
       @Query("SELECT b FROM ProductBatch b WHERE " +
                     "(:productId IS NULL OR b.product.productId = :productId) " +
                     "AND (:status IS NULL OR b.status = :status) " +
                     "AND (:expiryFrom IS NULL OR b.expiryDate >= :expiryFrom) " +
                     "AND (:expiryTo IS NULL OR b.expiryDate <= :expiryTo) " +
                     "AND b.isActive = true " +
                     "ORDER BY b.expiryDate ASC")
       List<ProductBatch> searchBatches(
                     @Param("productId") Integer productId,
                     @Param("status") ProductBatch.BatchStatus status,
                     @Param("expiryFrom") LocalDate expiryFrom,
                     @Param("expiryTo") LocalDate expiryTo);

       /**
        * Calculate total stock value (purchase price based)
        */
       @Query("SELECT COALESCE(SUM(b.stockQuantity * b.purchasePrice), 0) FROM ProductBatch b WHERE b.isActive = true")
       Double getTotalStockValue();

       /**
        * Get the last batch code for auto-generation
        */
       @Query("SELECT b.batchCode FROM ProductBatch b ORDER BY b.batchId DESC LIMIT 1")
       Optional<String> findLastBatchCode();

    /**
     * Find most recent batch for a product (for getting last purchase/selling price)
     */
    Optional<ProductBatch> findTopByProductProductIdOrderByReceivedDateDesc(Integer productId);
}
