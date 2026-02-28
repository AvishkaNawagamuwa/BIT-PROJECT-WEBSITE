package com.sampathgrocery.repository.supplier;

import com.sampathgrocery.entity.supplier.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Purchase Order Repository
 * Handles database operations for Purchase Orders
 */
@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {

    /**
     * Find purchase order by PO number
     */
    Optional<PurchaseOrder> findByPoNumber(String poNumber);

    /**
     * Find purchase orders by status
     */
    List<PurchaseOrder> findByStatus(PurchaseOrder.POStatus status);

    /**
     * Find purchase orders by supplier
     */
    List<PurchaseOrder> findBySupplierSupplierId(Integer supplierId);

    /**
     * Find purchase orders by supplier and status
     */
    List<PurchaseOrder> findBySupplierSupplierIdAndStatus(
            Integer supplierId,
            PurchaseOrder.POStatus status);

    /**
     * Find pending purchase orders (for approval)
     */
    List<PurchaseOrder> findByStatusOrderByRequestedDateDesc(PurchaseOrder.POStatus status);

    /**
     * Search purchase orders with filters
     */
    @Query("SELECT po FROM PurchaseOrder po WHERE " +
            "(:query IS NULL OR LOWER(po.poNumber) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(po.supplier.supplierName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:supplierId IS NULL OR po.supplier.supplierId = :supplierId) " +
            "AND (:status IS NULL OR po.status = :status) " +
            "AND (:fromDate IS NULL OR po.requestedDate >= :fromDate) " +
            "AND (:toDate IS NULL OR po.requestedDate <= :toDate) " +
            "ORDER BY po.requestedDate DESC")
    List<PurchaseOrder> searchPurchaseOrders(
            @Param("query") String query,
            @Param("supplierId") Integer supplierId,
            @Param("status") PurchaseOrder.POStatus status,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate);

    /**
     * Count active purchase orders (PENDING, APPROVED, ORDERED)
     */
    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status IN ('PENDING', 'APPROVED', 'ORDERED')")
    Long countActivePurchaseOrders();

    /**
     * Get the last PO number for auto-generation
     */
    @Query("SELECT po.poNumber FROM PurchaseOrder po ORDER BY po.requestId DESC LIMIT 1")
    Optional<String> findLastPoNumber();

    /**
     * Find POs that are waiting to receive or partially received
     * For GRN receiving dashboard
     */
    @Query("SELECT po FROM PurchaseOrder po WHERE " +
            "po.status IN ('APPROVED', 'ORDERED', 'PARTIALLY_RECEIVED') " +
            "ORDER BY po.expectedDeliveryDate ASC, po.requestedDate DESC")
    List<PurchaseOrder> findWaitingToReceive();

    /**
     * Find POs by multiple statuses
     */
    List<PurchaseOrder> findByStatusIn(List<PurchaseOrder.POStatus> statuses);

    /**
     * Count waiting POs (APPROVED or ORDERED status, not yet received)
     */
    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE " +
            "po.status IN ('APPROVED', 'ORDERED')")
    Long countWaitingPOs();

    /**
     * Count partially received POs
     */
    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE " +
            "po.status = 'PARTIALLY_RECEIVED'")
    Long countPartialPOs();
}
