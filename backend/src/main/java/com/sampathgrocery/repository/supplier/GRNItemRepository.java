package com.sampathgrocery.repository.supplier;

import com.sampathgrocery.entity.supplier.GRNItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * GRN Item Repository
 * Handles database operations for GRN line items
 */
@Repository
public interface GRNItemRepository extends JpaRepository<GRNItem, Integer> {

    /**
     * Find all items for a GRN
     */
    List<GRNItem> findByGrnGrnId(Integer grnId);

    /**
     * Find items by product
     */
    List<GRNItem> findByProductProductId(Integer productId);

    /**
     * Delete all items for a GRN
     */
    void deleteByGrnGrnId(Integer grnId);

    /**
     * Count items in a GRN
     */
    Long countByGrnGrnId(Integer grnId);
}
