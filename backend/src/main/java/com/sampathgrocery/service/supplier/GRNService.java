package com.sampathgrocery.service.supplier;

import com.sampathgrocery.dto.supplier.*;
import com.sampathgrocery.entity.product.Product;
import com.sampathgrocery.entity.product.ProductBatch;
import com.sampathgrocery.entity.product.StockMovement;
import com.sampathgrocery.entity.supplier.*;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.BusinessRuleViolationException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.product.ProductBatchRepository;
import com.sampathgrocery.repository.product.ProductRepository;
import com.sampathgrocery.repository.product.StockMovementRepository;
import com.sampathgrocery.repository.supplier.*;
import com.sampathgrocery.service.product.StockAlertService;
import com.sampathgrocery.util.CodeGenerator;
import com.sampathgrocery.util.PricingUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GRN Service - CRITICAL BUSINESS LOGIC
 * Handles Goods Receiving and automatic batch/stock creation
 */
@Service
@RequiredArgsConstructor
@Transactional
public class GRNService {

    private final GRNRepository grnRepository;
    private final GRNItemRepository grnItemRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductBatchRepository productBatchRepository;
    private final StockMovementRepository stockMovementRepository;
    private final PurchaseOrderService purchaseOrderService;
    private final StockAlertService stockAlertService;

    public List<GRNResponse> getAllGRNs(String query, Integer supplierId,
            GRN.GRNStatus status, LocalDate fromDate, LocalDate toDate) {

        List<GRN> grns = grnRepository.searchGRNs(query, supplierId, status, fromDate, toDate);
        return grns.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public GRNResponse getGRNById(Integer id) {
        GRN grn = findById(id);
        return toResponseWithItems(grn);
    }

    public GRNResponse createGRN(GRNRequest request, Integer createdBy) {
        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        // Validate items
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("GRN must have at least one item");
        }

        // Create GRN
        GRN grn = new GRN();
        grn.setGrnNumber(generateGRNNumber());
        grn.setSupplier(supplier);
        grn.setReceivedDate(request.getReceivedDate());
        grn.setInvoiceNumber(request.getInvoiceNumber());
        grn.setInvoiceDate(request.getInvoiceDate());
        grn.setStatus(GRN.GRNStatus.RECEIVED);
        grn.setNotes(request.getNotes());
        grn.setReceivedBy(createdBy);
        grn.setCreatedBy(createdBy);
        grn.setTaxAmount(request.getTaxAmount());
        grn.setDiscountAmount(request.getDiscountAmount());

        // Link to PO if provided
        if (request.getPurchaseOrderId() != null) {
            PurchaseOrder po = purchaseOrderRepository.findById(request.getPurchaseOrderId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("PurchaseOrder", "id", request.getPurchaseOrderId()));
            grn.setPurchaseOrder(po);
        }

        grn = grnRepository.save(grn);

        // Get initial batch code counter for sequential generation within transaction
        String lastBatchCode = productBatchRepository.findLastBatchCode().orElse(null);
        int batchCounter = 1;
        if (lastBatchCode != null && lastBatchCode.startsWith("BATCH-")) {
            try {
                batchCounter = Integer.parseInt(lastBatchCode.substring(6)) + 1;
            } catch (Exception e) {
                batchCounter = 1;
            }
        }

        // Create GRN items and calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        for (GRNItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            GRNItem item = new GRNItem();
            item.setGrn(grn);
            item.setProduct(product);
            // Generate unique batch code sequentially to avoid duplicates in same transaction
            if (itemReq.getBatchCode() != null && !itemReq.getBatchCode().trim().isEmpty()) {
                item.setBatchCode(itemReq.getBatchCode());
            } else {
                item.setBatchCode(String.format("BATCH-%05d", batchCounter++));
            }
            item.setOrderedQuantity(itemReq.getOrderedQuantity());
            item.setReceivedQuantity(itemReq.getReceivedQuantity());
            item.setFinalPurchasePrice(itemReq.getFinalPurchasePrice());

            // Calculate or use provided selling price
            if (itemReq.getSellingPrice() != null) {
                item.setSellingPrice(itemReq.getSellingPrice());
            } else {
                item.setSellingPrice(PricingUtil.calculateSellingPrice(itemReq.getFinalPurchasePrice()));
            }

            item.setManufacturedDate(itemReq.getManufacturedDate());
            item.setExpiryDate(itemReq.getExpiryDate());
            item.setNotes(itemReq.getNotes());

            BigDecimal lineTotal = item.getFinalPurchasePrice()
                    .multiply(BigDecimal.valueOf(item.getReceivedQuantity()));
            item.setLineTotal(lineTotal);
            subtotal = subtotal.add(lineTotal);

            grnItemRepository.save(item);
        }

        // Update GRN totals
        grn.setSubtotal(subtotal);
        BigDecimal grandTotal = subtotal.add(request.getTaxAmount()).subtract(request.getDiscountAmount());
        grn.setGrandTotal(grandTotal);
        grn = grnRepository.save(grn);

        return toResponseWithItems(grn);
    }

    /**
     * CRITICAL METHOD: Approve GRN and create batches + stock movements
     * Updates PO item received quantities and PO status automatically
     */
    public GRNResponse approveGRN(Integer id, Integer approvedBy) {
        GRN grn = findById(id);

        // Skip validation since we now receive directly
        // grn already has RECEIVED status

        // Get all GRN items
        List<GRNItem> items = grnItemRepository.findByGrnGrnId(grn.getGrnId());

        if (items.isEmpty()) {
            throw new BusinessRuleViolationException("Cannot approve GRN with no items");
        }

        // If linked to PO, validate and update receiving quantities
        if (grn.getPurchaseOrder() != null) {
            PurchaseOrder po = grn.getPurchaseOrder();
            List<PurchaseOrderItem> poItems = purchaseOrderItemRepository
                    .findByPurchaseOrderRequestId(po.getRequestId());

            for (GRNItem grnItem : items) {
                // Find matching PO item
                PurchaseOrderItem poItem = poItems.stream()
                        .filter(pi -> pi.getProduct().getProductId()
                                .equals(grnItem.getProduct().getProductId()))
                        .findFirst()
                        .orElseThrow(() -> new BusinessRuleViolationException(
                                "Product " + grnItem.getProduct().getProductName() +
                                        " not found in Purchase Order"));

                // Validate: cannot receive more than remaining
                int alreadyReceived = poItem.getReceivedQuantity() != null ? poItem.getReceivedQuantity() : 0;
                int remaining = poItem.getQuantity() - alreadyReceived;

                if (grnItem.getReceivedQuantity() > remaining) {
                    throw new BusinessRuleViolationException(
                            "Cannot receive " + grnItem.getReceivedQuantity() + " of " +
                                    grnItem.getProduct().getProductName() +
                                    ". Only " + remaining + " remaining.");
                }

                // Require batch code and purchase price
                if (grnItem.getBatchCode() == null || grnItem.getBatchCode().trim().isEmpty()) {
                    throw new BusinessRuleViolationException(
                            "Batch code is required for " + grnItem.getProduct().getProductName());
                }

                if (grnItem.getFinalPurchasePrice() == null
                        || grnItem.getFinalPurchasePrice().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new BusinessRuleViolationException(
                            "Purchase price is required for " + grnItem.getProduct().getProductName());
                }
            }
        }

        // For each GRN item, create batch and stock movement
        for (GRNItem grnItem : items) {
            if (grnItem.getReceivedQuantity() <= 0) {
                continue; // Skip items with zero quantity
            }

            // Create ProductBatch
            ProductBatch batch = new ProductBatch();
            batch.setBatchCode(grnItem.getBatchCode());
            batch.setProduct(grnItem.getProduct());
            batch.setGrn(grn);
            batch.setGrnItem(grnItem);
            batch.setSupplier(grn.getSupplier());
            batch.setPurchasePrice(grnItem.getFinalPurchasePrice());
            batch.setSellingPrice(grnItem.getSellingPrice() != null ? grnItem.getSellingPrice()
                    : grnItem.getFinalPurchasePrice().multiply(BigDecimal.valueOf(1.3)));
            batch.setMrp(batch.getSellingPrice());
            batch.setReceivedQuantity(grnItem.getReceivedQuantity());
            batch.setStockQuantity(grnItem.getReceivedQuantity());
            batch.setManufacturedDate(grnItem.getManufacturedDate());
            batch.setExpiryDate(grnItem.getExpiryDate());
            batch.setReceivedDate(grn.getReceivedDate());
            batch.setStatus(ProductBatch.BatchStatus.IN_STOCK); // Use IN_STOCK status
            batch.setIsActive(true);
            batch.setCreatedBy(approvedBy);
            batch.setUpdatedBy(approvedBy);

            batch = productBatchRepository.save(batch);

            // Create StockMovement (IN - GRN)
            StockMovement movement = new StockMovement();
            movement.setBatch(batch);
            movement.setMovementType(StockMovement.MovementType.GRN);
            movement.setQuantity(grnItem.getReceivedQuantity());
            movement.setBeforeQuantity(0);
            movement.setAfterQuantity(grnItem.getReceivedQuantity());
            movement.setReferenceNumber(grn.getGrnNumber());
            movement.setReferenceType("GRN");
            movement.setNotes("Stock received from GRN: " + grn.getGrnNumber());
            movement.setCreatedBy(approvedBy);

            stockMovementRepository.save(movement);

            // Check and resolve stock alerts for this product
            stockAlertService.checkAndResolveAlertsForProduct(grnItem.getProduct().getProductId());
        }

        // Update GRN status
        grn.setStatus(GRN.GRNStatus.RECEIVED);
        grn.setVerifiedBy(approvedBy);
        grn.setUpdatedBy(approvedBy);
        grn = grnRepository.save(grn);

        // Update PO item received quantities and PO status
        if (grn.getPurchaseOrder() != null) {
            updatePurchaseOrderReceiving(grn.getPurchaseOrder().getRequestId(), items);
        }

        return toResponseWithItems(grn);
    }

    /**
     * Update PO item received quantities and PO status after GRN approval
     */
    private void updatePurchaseOrderReceiving(Integer poId, List<GRNItem> grnItems) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", poId));

        List<PurchaseOrderItem> poItems = purchaseOrderItemRepository
                .findByPurchaseOrderRequestId(poId);

        int totalOrdered = 0;
        int totalReceived = 0;

        // Update received quantities
        for (PurchaseOrderItem poItem : poItems) {
            totalOrdered += poItem.getQuantity();

            // Find matching GRN item
            GRNItem matchingGrnItem = grnItems.stream()
                    .filter(gi -> gi.getProduct().getProductId().equals(poItem.getProduct().getProductId()))
                    .findFirst()
                    .orElse(null);

            if (matchingGrnItem != null) {
                // Add to cumulative received quantity
                int currentReceived = poItem.getReceivedQuantity() != null ? poItem.getReceivedQuantity() : 0;
                poItem.setReceivedQuantity(currentReceived + matchingGrnItem.getReceivedQuantity());
                purchaseOrderItemRepository.save(poItem);
            }

            totalReceived += (poItem.getReceivedQuantity() != null ? poItem.getReceivedQuantity() : 0);
        }

        // Update PO status based on total received (ERP Standard Logic)
        if (totalReceived == 0) {
            // No items received yet - keep as ORDERED
            po.setStatus(PurchaseOrder.POStatus.ORDERED);
        } else if (totalReceived < totalOrdered) {
            // Partial delivery - some items received
            po.setStatus(PurchaseOrder.POStatus.PARTIALLY_RECEIVED);
        } else {
            // Full delivery - all items received
            po.setStatus(PurchaseOrder.POStatus.RECEIVED);
        }

        purchaseOrderRepository.save(po);
    }

    public GRNResponse receiveGRN(Integer id) {
        GRN grn = findById(id);

        // Skip validation - already received
        grn.setStatus(GRN.GRNStatus.RECEIVED);
        grn = grnRepository.save(grn);

        return toResponse(grn);
    }

    public GRNResponse rejectGRN(Integer id, String reason) {
        GRN grn = findById(id);

        // No reject status anymore - just use RECEIVED
        grn.setStatus(GRN.GRNStatus.RECEIVED);
        grn.setNotes((grn.getNotes() != null ? grn.getNotes() + "\n" : "") + "REJECTED: " + reason);
        grn = grnRepository.save(grn);

        return toResponse(grn);
    }

    /**
     * Update draft GRN
     * Allows modifying quantities, prices, expiry dates, batch codes before
     * approval
     */
    public GRNResponse updateDraftGRN(Integer id, GRNRequest request, Integer updatedBy) {
        GRN grn = findById(id);

        // Skip validation - allow updates

        // Update GRN header
        grn.setReceivedDate(request.getReceivedDate());
        grn.setInvoiceNumber(request.getInvoiceNumber());
        grn.setInvoiceDate(request.getInvoiceDate());
        grn.setNotes(request.getNotes());
        grn.setTaxAmount(request.getTaxAmount());
        grn.setDiscountAmount(request.getDiscountAmount());
        grn.setUpdatedBy(updatedBy);

        // Delete existing items and recreate
        grnItemRepository.deleteByGrnGrnId(id);

        // Recreate items with new data
        BigDecimal subtotal = BigDecimal.ZERO;
        for (GRNItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            GRNItem item = new GRNItem();
            item.setGrn(grn);
            item.setProduct(product);
            item.setBatchCode(itemReq.getBatchCode());
            item.setOrderedQuantity(itemReq.getOrderedQuantity());
            item.setReceivedQuantity(itemReq.getReceivedQuantity());
            item.setFinalPurchasePrice(itemReq.getFinalPurchasePrice());
            item.setSellingPrice(itemReq.getSellingPrice());
            item.setManufacturedDate(itemReq.getManufacturedDate());
            item.setExpiryDate(itemReq.getExpiryDate());
            item.setNotes(itemReq.getNotes());

            BigDecimal lineTotal = item.getFinalPurchasePrice()
                    .multiply(BigDecimal.valueOf(item.getReceivedQuantity()));
            item.setLineTotal(lineTotal);
            subtotal = subtotal.add(lineTotal);

            grnItemRepository.save(item);
        }

        // Update totals
        grn.setSubtotal(subtotal);
        BigDecimal grandTotal = subtotal.add(request.getTaxAmount()).subtract(request.getDiscountAmount());
        grn.setGrandTotal(grandTotal);
        grn = grnRepository.save(grn);

        return toResponseWithItems(grn);
    }

    /**
     * Get list of POs waiting to be received (for GRN dashboard)
     */
    public List<WaitingPOResponse> getWaitingPOs() {
        List<PurchaseOrder> waitingPOs = purchaseOrderRepository.findWaitingToReceive();

        return waitingPOs.stream().map(po -> {
            WaitingPOResponse response = new WaitingPOResponse();
            response.setRequestId(po.getRequestId());
            response.setPoNumber(po.getPoNumber());
            response.setSupplierId(po.getSupplier().getSupplierId());
            response.setSupplierName(po.getSupplier().getSupplierName());
            response.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
            response.setRequestedDate(po.getRequestedDate());
            response.setStatus(po.getStatus());
            response.setGrandTotal(po.getGrandTotal());

            // Calculate receiving statistics
            List<PurchaseOrderItem> items = purchaseOrderItemRepository
                    .findByPurchaseOrderRequestId(po.getRequestId());

            int totalOrdered = items.stream().mapToInt(PurchaseOrderItem::getQuantity).sum();
            int totalReceived = items.stream()
                    .mapToInt(item -> item.getReceivedQuantity() != null ? item.getReceivedQuantity() : 0)
                    .sum();
            int totalRemaining = totalOrdered - totalReceived;

            response.setTotalItems(items.size());
            response.setTotalOrdered(totalOrdered);
            response.setTotalReceived(totalReceived);
            response.setTotalRemaining(totalRemaining);

            return response;
        }).collect(Collectors.toList());
    }

    /**
     * Get dashboard statistics for GRN Records tab
     */
    public GRNDashboardStats getDashboardStats() {
        GRNDashboardStats stats = new GRNDashboardStats();

        // Total received GRNs
        stats.setTotalGRNs(grnRepository.countByStatus(GRN.GRNStatus.RECEIVED));

        // GRNs received this month
        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate lastDayOfMonth = firstDayOfMonth.plusMonths(1).minusDays(1);
        stats.setThisMonthGRNs(grnRepository.countGRNsInDateRange(firstDayOfMonth, lastDayOfMonth));

        // GRNs with quality issues
        stats.setGrnWithIssues(grnRepository.countGRNsWithIssues());

        // Total value of received GRNs
        stats.setTotalValue(grnRepository.getTotalGRNValue());

        // Waiting and partial POs
        stats.setWaitingPOs(purchaseOrderRepository.countWaitingPOs());
        stats.setPartialPOs(purchaseOrderRepository.countPartialPOs());

        return stats;
    }

    /**
     * CRITICAL: Create GRN from PO with auto-fill and partial receiving support
     * Auto-fills items with remaining quantities (ordered - already received)
     */
    public GRNResponse createGRNFromPO(Integer poId, Integer createdBy) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", poId));

        // Allow receiving ONLY from ORDERED or PARTIALLY_RECEIVED POs
        if (po.getStatus() != PurchaseOrder.POStatus.ORDERED &&
                po.getStatus() != PurchaseOrder.POStatus.PARTIALLY_RECEIVED) {
            throw new BusinessRuleViolationException(
                    "Only ORDERED or PARTIALLY_RECEIVED purchase orders can be received. " +
                            "Current status: " + po.getStatus() + ". Please mark as 'Ordered' first.");
        }

        GRNRequest request = new GRNRequest();
        request.setPurchaseOrderId(po.getRequestId());
        request.setSupplierId(po.getSupplier().getSupplierId());
        request.setReceivedDate(LocalDate.now());

        // Get PO items and calculate remaining quantities
        List<PurchaseOrderItem> poItems = purchaseOrderItemRepository
                .findByPurchaseOrderRequestId(po.getRequestId());

        // Get initial batch code counter for sequential generation
        String lastBatchCode = productBatchRepository.findLastBatchCode().orElse(null);
        final int[] batchCounter = {1}; // Use array to allow modification in lambda
        if (lastBatchCode != null && lastBatchCode.startsWith("BATCH-")) {
            try {
                batchCounter[0] = Integer.parseInt(lastBatchCode.substring(6)) + 1;
            } catch (Exception e) {
                batchCounter[0] = 1;
            }
        }

        // Only include items that have remaining quantity
        request.setItems(poItems.stream().filter(poItem -> {
            int receivedQty = poItem.getReceivedQuantity() != null ? poItem.getReceivedQuantity() : 0;
            return receivedQty < poItem.getQuantity(); // Has remaining quantity
        }).map(poItem -> {
            int receivedQty = poItem.getReceivedQuantity() != null ? poItem.getReceivedQuantity() : 0;
            int remainingQty = poItem.getQuantity() - receivedQty;

            GRNItemRequest grnItem = new GRNItemRequest();
            grnItem.setProductId(poItem.getProduct().getProductId());
            grnItem.setOrderedQuantity(poItem.getQuantity()); // Original ordered quantity
            grnItem.setAlreadyReceivedQuantity(receivedQty); // Cumulative received from previous GRNs
            grnItem.setReceivedQuantity(remainingQty); // Default to remaining (editable by user)

            // Use expected unit price if available, otherwise get last purchase price
            if (poItem.getExpectedUnitPrice() != null) {
                grnItem.setFinalPurchasePrice(poItem.getExpectedUnitPrice());
            } else {
                // Get last purchase price for this product
                ProductBatch lastBatch = productBatchRepository
                        .findTopByProductProductIdOrderByReceivedDateDesc(poItem.getProduct().getProductId())
                        .orElse(null);
                if (lastBatch != null) {
                    grnItem.setFinalPurchasePrice(lastBatch.getPurchasePrice());
                    grnItem.setSellingPrice(lastBatch.getSellingPrice());
                } else {
                    // No history, estimate selling price as purchase price + 30% markup
                    BigDecimal estimatedPurchasePrice = poItem.getExpectedUnitPrice() != null
                            ? poItem.getExpectedUnitPrice()
                            : BigDecimal.valueOf(100.00); // Default fallback
                    grnItem.setFinalPurchasePrice(estimatedPurchasePrice);
                    // Estimate selling price as purchase + 30% markup (can be edited)
                    grnItem.setSellingPrice(estimatedPurchasePrice
                            .multiply(BigDecimal.valueOf(1.30)));
                }
            }

            // Generate unique batch code sequentially
            grnItem.setBatchCode(String.format("BATCH-%05d", batchCounter[0]++));
            return grnItem;
        }).collect(Collectors.toList()));

        if (request.getItems().isEmpty()) {
            throw new BusinessRuleViolationException(
                    "All items in this PO have already been fully received");
        }

        return createGRN(request, createdBy);
    }

    /**
     * Prepare GRN data from PO (read-only, for form auto-fill)
     * Does NOT create GRN record in database
     */
    public GRNResponse prepareGRNFromPO(Integer poId) {
        PurchaseOrder po = purchaseOrderRepository.findById(poId)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", poId));

        // Allow preparing from ORDERED or PARTIALLY_RECEIVED POs
        if (po.getStatus() != PurchaseOrder.POStatus.ORDERED &&
                po.getStatus() != PurchaseOrder.POStatus.PARTIALLY_RECEIVED) {
            throw new BusinessRuleViolationException(
                    "Only ORDERED or PARTIALLY_RECEIVED purchase orders can be received. " +
                            "Current status: " + po.getStatus());
        }

        // Get PO items
        List<PurchaseOrderItem> poItems = purchaseOrderItemRepository
                .findByPurchaseOrderRequestId(po.getRequestId());

        // Build response object (NOT saved to database)
        GRNResponse response = new GRNResponse();
        response.setGrnNumber("AUTO-GEN");
        response.setPoNumber(po.getPoNumber());
        response.setSupplierName(po.getSupplier().getSupplierName());
        response.setSupplierId(po.getSupplier().getSupplierId());
        response.setReceivedDate(LocalDate.now());
        response.setStatus(GRN.GRNStatus.RECEIVED); // Will be set when actually received

        // Get initial batch code counter for sequential generation
        String lastBatchCode = productBatchRepository.findLastBatchCode().orElse(null);
        final int[] batchCounter = {1}; // Use array to allow modification in lambda
        if (lastBatchCode != null && lastBatchCode.startsWith("BATCH-")) {
            try {
                batchCounter[0] = Integer.parseInt(lastBatchCode.substring(6)) + 1;
            } catch (Exception e) {
                batchCounter[0] = 1;
            }
        }

        // Prepare items with remaining quantities
        List<GRNItemResponse> items = poItems.stream().filter(poItem -> {
            int receivedQty = poItem.getReceivedQuantity() != null ? poItem.getReceivedQuantity() : 0;
            return receivedQty < poItem.getQuantity(); // Has remaining quantity
        }).map(poItem -> {
            int receivedQty = poItem.getReceivedQuantity() != null ? poItem.getReceivedQuantity() : 0;
            int remainingQty = poItem.getQuantity() - receivedQty;

            GRNItemResponse item = new GRNItemResponse();
            item.setProductId(poItem.getProduct().getProductId());
            item.setProductName(poItem.getProduct().getProductName());
            item.setOrderedQuantity(poItem.getQuantity());
            item.setAlreadyReceivedQuantity(receivedQty);
            item.setReceivedQuantity(remainingQty); // Default to remaining

            // Set prices
            ProductBatch lastBatch = productBatchRepository
                    .findTopByProductProductIdOrderByReceivedDateDesc(poItem.getProduct().getProductId())
                    .orElse(null);

            if (poItem.getExpectedUnitPrice() != null) {
                item.setFinalPurchasePrice(poItem.getExpectedUnitPrice());
                // Set selling price from last batch or calculate with 30% markup
                if (lastBatch != null && lastBatch.getSellingPrice() != null) {
                    item.setSellingPrice(lastBatch.getSellingPrice());
                } else {
                    item.setSellingPrice(poItem.getExpectedUnitPrice().multiply(BigDecimal.valueOf(1.30)));
                }
            } else {
                if (lastBatch != null) {
                    item.setFinalPurchasePrice(lastBatch.getPurchasePrice());
                    item.setSellingPrice(lastBatch.getSellingPrice());
                } else {
                    BigDecimal estimatedPrice = BigDecimal.valueOf(100.00);
                    item.setFinalPurchasePrice(estimatedPrice);
                    item.setSellingPrice(estimatedPrice.multiply(BigDecimal.valueOf(1.30)));
                }
            }

            // Generate unique batch code sequentially
            item.setBatchCode(String.format("BATCH-%05d", batchCounter[0]++));
            return item;
        }).collect(Collectors.toList());

        response.setItems(items);
        return response;
    }

    /**
     * SIMPLIFIED WORKFLOW: Receive goods from PO in ONE transaction
     * Creates GRN + creates batches + updates inventory + updates PO status
     * No draft mode - direct receiving
     */
    @Transactional
    public GRNResponse receiveGoodsFromPO(GRNRequest request, Integer receivedBy) {
        // Validate PO
        PurchaseOrder po = purchaseOrderRepository.findById(request.getPurchaseOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", request.getPurchaseOrderId()));

        if (po.getStatus() != PurchaseOrder.POStatus.ORDERED &&
                po.getStatus() != PurchaseOrder.POStatus.PARTIALLY_RECEIVED) {
            throw new BusinessRuleViolationException(
                    "Can only receive from ORDERED or PARTIALLY_RECEIVED purchase orders");
        }

        // Create GRN record
        GRN grn = new GRN();
        grn.setGrnNumber(generateGRNNumber());
        grn.setSupplier(po.getSupplier());
        grn.setPurchaseOrder(po);
        grn.setReceivedDate(request.getReceivedDate() != null ? request.getReceivedDate() : LocalDate.now());
        grn.setInvoiceNumber(request.getInvoiceNumber());
        grn.setNotes(request.getNotes());
        grn.setReceivedBy(receivedBy);
        grn.setCreatedBy(receivedBy);
        grn.setStatus(GRN.GRNStatus.RECEIVED); // Direct to RECEIVED (no draft)
        grn.setGrandTotal(BigDecimal.ZERO); // Will update after items

        // SAVE GRN FIRST (so it's not transient when we create GRNItems)
        grn = grnRepository.save(grn);

        BigDecimal grandTotal = BigDecimal.ZERO;

        // Get initial batch code counter for sequential generation within transaction
        String lastBatchCode = productBatchRepository.findLastBatchCode().orElse(null);
        int batchCounter = 1;
        if (lastBatchCode != null && lastBatchCode.startsWith("BATCH-")) {
            try {
                batchCounter = Integer.parseInt(lastBatchCode.substring(6)) + 1;
            } catch (Exception e) {
                batchCounter = 1;
            }
        }

        // Process each item: Create GRN item + Create batch + Update inventory
        for (GRNItemRequest itemReq : request.getItems()) {
            if (itemReq.getReceivedQuantity() == null || itemReq.getReceivedQuantity() <= 0) {
                continue; // Skip items with no quantity
            }

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            // Create GRN Item
            GRNItem grnItem = new GRNItem();
            grnItem.setGrn(grn);
            grnItem.setProduct(product);
            grnItem.setOrderedQuantity(itemReq.getOrderedQuantity());
            grnItem.setReceivedQuantity(itemReq.getReceivedQuantity());
            grnItem.setFinalPurchasePrice(itemReq.getFinalPurchasePrice());
            grnItem.setSellingPrice(itemReq.getSellingPrice());
            grnItem.setExpiryDate(itemReq.getExpiryDate());
            // Generate unique batch code sequentially to avoid duplicates in same transaction
            if (itemReq.getBatchCode() != null && !itemReq.getBatchCode().trim().isEmpty()) {
                grnItem.setBatchCode(itemReq.getBatchCode());
            } else {
                grnItem.setBatchCode(String.format("BATCH-%05d", batchCounter++));
            }
            grnItem.setLineTotal(BigDecimal.valueOf(itemReq.getReceivedQuantity())
                    .multiply(itemReq.getFinalPurchasePrice()));

            grnItemRepository.save(grnItem);
            grandTotal = grandTotal.add(grnItem.getLineTotal());

            // Create ProductBatch
            ProductBatch batch = new ProductBatch();
            batch.setProduct(product);
            batch.setBatchCode(grnItem.getBatchCode());
            batch.setReceivedQuantity(itemReq.getReceivedQuantity());
            batch.setStockQuantity(itemReq.getReceivedQuantity());
            batch.setPurchasePrice(itemReq.getFinalPurchasePrice());
            // Auto-calculate selling price if not provided (30% markup)
            batch.setSellingPrice(itemReq.getSellingPrice() != null
                    ? itemReq.getSellingPrice()
                    : itemReq.getFinalPurchasePrice().multiply(BigDecimal.valueOf(1.30)));
            batch.setExpiryDate(itemReq.getExpiryDate());
            batch.setReceivedDate(grn.getReceivedDate());
            batch.setStatus(ProductBatch.BatchStatus.IN_STOCK);
            productBatchRepository.save(batch);

            // Create StockMovement
            StockMovement movement = new StockMovement();
            movement.setBatch(batch);
            movement.setMovementType(StockMovement.MovementType.GRN);
            movement.setQuantity(itemReq.getReceivedQuantity());
            movement.setBeforeQuantity(0);
            movement.setAfterQuantity(itemReq.getReceivedQuantity());
            movement.setReferenceNumber(grn.getGrnNumber());
            movement.setReferenceType("GRN");
            movement.setNotes("GRN: " + grn.getGrnNumber());
            stockMovementRepository.save(movement);
        }

        grn.setGrandTotal(grandTotal);
        grn = grnRepository.save(grn);

        // Update PO receiving status
        List<GRNItem> grnItems = grnItemRepository.findByGrnGrnId(grn.getGrnId());
        updatePurchaseOrderReceiving(po.getRequestId(), grnItems);

        return toResponseWithItems(grn);
    }

    public Double getTotalPurchaseValue(LocalDate fromDate, LocalDate toDate) {
        return grnRepository.getTotalPurchaseValue(fromDate, toDate);
    }

    public String generateGRNNumber() {
        String lastCode = grnRepository.findLastGrnNumber().orElse(null);
        return CodeGenerator.generateGRNNumber(lastCode);
    }

    private String generateBatchCode() {
        String lastCode = productBatchRepository.findLastBatchCode().orElse(null);
        return CodeGenerator.generateBatchCode(lastCode);
    }

    // Helper methods
    private GRN findById(Integer id) {
        return grnRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GRN", "id", id));
    }

    private GRNResponse toResponse(GRN grn) {
        GRNResponse response = new GRNResponse();
        response.setGrnId(grn.getGrnId());
        response.setGrnNumber(grn.getGrnNumber());
        response.setSupplierId(grn.getSupplier().getSupplierId());
        response.setSupplierName(grn.getSupplier().getSupplierName());
        response.setReceivedDate(grn.getReceivedDate());
        response.setInvoiceNumber(grn.getInvoiceNumber());
        response.setInvoiceDate(grn.getInvoiceDate());
        response.setSubtotal(grn.getSubtotal());
        response.setTaxAmount(grn.getTaxAmount());
        response.setDiscountAmount(grn.getDiscountAmount());
        response.setGrandTotal(grn.getGrandTotal());
        response.setQualityStatus(grn.getQualityStatus());
        response.setStatus(grn.getStatus());
        response.setNotes(grn.getNotes());
        response.setReceivedBy(grn.getReceivedBy());
        response.setVerifiedBy(grn.getVerifiedBy());
        response.setCreatedAt(grn.getCreatedAt());

        if (grn.getPurchaseOrder() != null) {
            response.setPurchaseOrderId(grn.getPurchaseOrder().getRequestId());
            response.setPoNumber(grn.getPurchaseOrder().getPoNumber());
        }

        return response;
    }

    private GRNResponse toResponseWithItems(GRN grn) {
        GRNResponse response = toResponse(grn);

        List<GRNItem> items = grnItemRepository.findByGrnGrnId(grn.getGrnId());

        // If GRN is linked to a PO, get PO items to populate alreadyReceivedQuantity
        Map<Integer, Integer> alreadyReceivedMap = new HashMap<>();
        if (grn.getPurchaseOrder() != null) {
            List<PurchaseOrderItem> poItems = purchaseOrderItemRepository
                    .findByPurchaseOrderRequestId(grn.getPurchaseOrder().getRequestId());
            for (PurchaseOrderItem poItem : poItems) {
                int alreadyReceived = poItem.getReceivedQuantity() != null ? poItem.getReceivedQuantity() : 0;
                alreadyReceivedMap.put(poItem.getProduct().getProductId(), alreadyReceived);
            }
        }

        response.setItems(items.stream()
                .map(item -> toItemResponse(item, alreadyReceivedMap))
                .collect(Collectors.toList()));
        response.setTotalItems(items.size());
        response.setTotalQuantity(items.stream().mapToInt(GRNItem::getReceivedQuantity).sum());

        return response;
    }

    private GRNItemResponse toItemResponse(GRNItem item, Map<Integer, Integer> alreadyReceivedMap) {
        GRNItemResponse response = new GRNItemResponse();
        response.setGrnItemId(item.getGrnItemId());
        response.setProductId(item.getProduct().getProductId());
        response.setProductName(item.getProduct().getProductName());
        response.setProductCode(item.getProduct().getProductCode());
        response.setBatchCode(item.getBatchCode());
        response.setOrderedQuantity(item.getOrderedQuantity());

        // Set alreadyReceivedQuantity from map if available
        if (alreadyReceivedMap.containsKey(item.getProduct().getProductId())) {
            response.setAlreadyReceivedQuantity(alreadyReceivedMap.get(item.getProduct().getProductId()));
        } else {
            response.setAlreadyReceivedQuantity(0);
        }

        response.setReceivedQuantity(item.getReceivedQuantity());

        if (item.getOrderedQuantity() != null) {
            response.setVariance(item.getReceivedQuantity() - item.getOrderedQuantity());
        }

        response.setFinalPurchasePrice(item.getFinalPurchasePrice());
        response.setSellingPrice(item.getSellingPrice());
        response.setLineTotal(item.getLineTotal());
        response.setManufacturedDate(item.getManufacturedDate());
        response.setExpiryDate(item.getExpiryDate());
        response.setNotes(item.getNotes());
        return response;
    }

    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
}
