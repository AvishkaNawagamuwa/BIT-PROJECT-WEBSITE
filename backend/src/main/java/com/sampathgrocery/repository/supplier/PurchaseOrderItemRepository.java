package com.sampathgrocery.repository.supplier;

import com.sampathgrocery.entity.supplier.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Purchase Order Item Repository
 * Handles database operations for PO line items
 */
@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Integer> {

    /**
     * Find all items for a purchase order
     */
    List<PurchaseOrderItem> findByPurchaseOrderRequestId(Integer requestId);

    /**
     * Delete all items for a purchase order
     */
    void deleteByPurchaseOrderRequestId(Integer requestId);

    /**
     * Count items in a purchase order
     */
    Long countByPurchaseOrderRequestId(Integer requestId);

    /**
     * Find last purchase price for a supplier-product combination
     * Gets the most recent unit price from approved/ordered POs
     */
    @Query("SELECT poi.expectedUnitPrice FROM PurchaseOrderItem poi " +
            "JOIN poi.purchaseOrder po " +
            "WHERE po.supplier.supplierId = :supplierId " +
            "AND poi.product.productId = :productId " +
            "AND po.status IN ('APPROVED', 'ORDERED', 'RECEIVED') " +
            "ORDER BY po.requestedDate DESC, poi.reorderItemId DESC")
    Optional<BigDecimal> findLastPurchasePrice(@Param("supplierId") Integer supplierId,
            @Param("productId") Integer productId);
}
