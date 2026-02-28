package com.sampathgrocery.repository.supplier;

import com.sampathgrocery.entity.supplier.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

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
}
