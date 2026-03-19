package com.sampathgrocery.service.product;

import com.sampathgrocery.dto.product.ProductBatchRequest;
import com.sampathgrocery.dto.product.ProductBatchResponse;
import com.sampathgrocery.dto.product.StockAdjustmentRequest;
import com.sampathgrocery.entity.product.Product;
import com.sampathgrocery.entity.product.ProductBatch;
import com.sampathgrocery.entity.product.ProductBatch.BatchStatus;
import com.sampathgrocery.entity.product.StockMovement;
import com.sampathgrocery.entity.supplier.Supplier;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.BusinessRuleViolationException;
import com.sampathgrocery.exception.InsufficientStockException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.product.ProductBatchRepository;
import com.sampathgrocery.repository.product.ProductRepository;
import com.sampathgrocery.repository.supplier.SupplierRepository;
import com.sampathgrocery.util.CodeGenerator;
import com.sampathgrocery.util.StockCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Product Batch Service - Manages inventory batches and FIFO operations
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProductBatchService {

    private final ProductBatchRepository batchRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementService stockMovementService;
    private final StockAlertService stockAlertService;

    public List<ProductBatchResponse> getAllBatches(Integer productId, BatchStatus status,
            LocalDate expiryFrom, LocalDate expiryTo) {

        List<ProductBatch> batches = batchRepository.searchBatches(productId, status, expiryFrom, expiryTo);
        return batches.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductBatchResponse getBatchById(Integer id) {
        ProductBatch batch = findById(id);
        return toResponse(batch);
    }

    public List<ProductBatchResponse> getBatchesByProduct(Integer productId) {
        List<ProductBatch> batches = batchRepository.findActiveByProductOrderByExpiryDate(productId);
        return batches.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductBatchResponse> getExpiringBatches(LocalDate beforeDate) {
        LocalDate today = LocalDate.now();
        List<ProductBatch> batches = batchRepository.findBatchesExpiringSoon(today, beforeDate);
        return batches.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Manual batch creation (normally batches are auto-created via GRN)
     */
    public ProductBatchResponse createBatch(ProductBatchRequest request, Integer createdBy) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        ProductBatch batch = new ProductBatch();
        batch.setBatchCode(request.getBatchCode() != null ? request.getBatchCode() : generateBatchCode());

        // Auto-generate barcode if not provided
        String barcode = request.getBarcode() != null ? request.getBarcode() : generateBarcodeForBatch();
        batch.setBarcode(barcode);

        batch.setProduct(product);
        batch.setSupplier(supplier);
        batch.setPurchasePrice(request.getPurchasePrice());
        batch.setSellingPrice(request.getSellingPrice());
        batch.setMrp(request.getMrp());
        batch.setReceivedQuantity(request.getReceivedQuantity());
        batch.setStockQuantity(request.getReceivedQuantity());
        batch.setManufacturedDate(request.getManufacturedDate());
        batch.setExpiryDate(request.getExpiryDate());
        batch.setReceivedDate(request.getReceivedDate() != null ? request.getReceivedDate() : LocalDate.now());
        batch.setStatus(BatchStatus.APPROVED);
        batch.setIsActive(true);
        batch.setCreatedBy(createdBy);
        batch.setUpdatedBy(createdBy);

        batch = batchRepository.save(batch);

        // Log stock movement
        stockMovementService.logMovement(
                batch.getBatchId(),
                StockMovement.MovementType.ADJUSTMENT,
                request.getReceivedQuantity(),
                batch.getBatchCode(),
                "MANUAL_BATCH",
                "Manual batch creation",
                createdBy);

        // Check and update alerts
        stockAlertService.checkAndResolveAlertsForProduct(product.getProductId());

        return toResponse(batch);
    }

    /**
     * Update selling price for a batch
     */
    public ProductBatchResponse updateSellingPrice(Integer batchId, BigDecimal newPrice, Integer updatedBy) {
        ProductBatch batch = findById(batchId);

        batch.setSellingPrice(newPrice);
        batch.setUpdatedBy(updatedBy);
        batch = batchRepository.save(batch);

        return toResponse(batch);
    }

    /**
     * Adjust stock for a specific batch (manual adjustments)
     */
    public ProductBatchResponse adjustStock(Integer batchId, Integer quantity,
            String reason, String notes, Integer userId) {

        ProductBatch batch = findById(batchId);

        int beforeQuantity = batch.getStockQuantity();
        int afterQuantity = beforeQuantity + quantity;

        if (afterQuantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }

        batch.setStockQuantity(afterQuantity);
        batch.setUpdatedBy(userId);
        batch = batchRepository.save(batch);

        // Determine movement type based on reason
        StockMovement.MovementType movementType = switch (reason) {
            case "DAMAGE" -> StockMovement.MovementType.DAMAGE;
            case "EXPIRED" -> StockMovement.MovementType.EXPIRED;
            case "RETURN" -> StockMovement.MovementType.RETURN;
            default -> StockMovement.MovementType.ADJUSTMENT;
        };

        // Log the adjustment
        stockMovementService.logMovement(
                batchId,
                movementType,
                quantity,
                "ADJ-" + batchId,
                "ADJUSTMENT",
                notes != null ? notes : "Manual stock adjustment - " + reason,
                userId);

        // Update alerts
        stockAlertService.checkAndResolveAlertsForProduct(batch.getProduct().getProductId());

        return toResponse(batch);
    }

    /**
     * CRITICAL: Deduct stock using FIFO (First Expiry, First Out)
     * Used for sales/pos transactions
     */
    public void deductStockFIFO(Integer productId, Integer quantity,
            String referenceNumber, Integer userId) {

        // Get batches ordered by expiry date (FIFO)
        List<ProductBatch> batches = batchRepository.findActiveByProductOrderByExpiryDate(productId);

        int remainingToDeduct = quantity;

        for (ProductBatch batch : batches) {
            if (remainingToDeduct <= 0)
                break;

            if (batch.getStockQuantity() > 0) {
                int deductFromThisBatch = Math.min(batch.getStockQuantity(), remainingToDeduct);

                int beforeQty = batch.getStockQuantity();
                batch.setStockQuantity(beforeQty - deductFromThisBatch);
                batch.setUpdatedBy(userId);
                batchRepository.save(batch);

                // Log movement
                stockMovementService.logMovement(
                        batch.getBatchId(),
                        StockMovement.MovementType.SALE,
                        -deductFromThisBatch,
                        referenceNumber,
                        "SALE",
                        "Stock deducted via FIFO for sale",
                        userId);

                remainingToDeduct -= deductFromThisBatch;
            }
        }

        if (remainingToDeduct > 0) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));
            throw new InsufficientStockException(
                    String.format("Insufficient stock for product %s. Required: %d, Available: %d",
                            product.getProductName(), quantity, quantity - remainingToDeduct));
        }

        // Update alerts after deduction
        stockAlertService.checkAndResolveAlertsForProduct(productId);
    }

    public Integer getTotalStockByProduct(Integer productId) {
        return batchRepository.getTotalStockByProduct(productId);
    }

    public Double getTotalStockValue() {
        return batchRepository.getTotalStockValue();
    }

    /**
     * Get batch details by barcode
     * Returns the batch with earliest expiry date (FIFO principle)
     */
    public ProductBatchResponse getBatchByBarcode(String barcode) {
        ProductBatch batch = batchRepository.findLatestActiveBatchByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "barcode", barcode));
        return toResponse(batch);
    }

    /**
     * Get batch pricing information by barcode
     * Used for POS/Sales to get unit price quickly
     */
    public Map<String, Object> getPricingByBarcode(String barcode) {
        ProductBatch batch = batchRepository.findLatestActiveBatchByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "barcode", barcode));

        Map<String, Object> pricing = new java.util.HashMap<>();
        pricing.put("batchId", batch.getBatchId());
        pricing.put("barcode", batch.getBarcode());
        pricing.put("productId", batch.getProduct().getProductId());
        pricing.put("productName", batch.getProduct().getProductName());
        pricing.put("productCode", batch.getProduct().getProductCode());
        pricing.put("purchasePrice", batch.getPurchasePrice());
        pricing.put("sellingPrice", batch.getSellingPrice());
        pricing.put("mrp", batch.getMrp());
        pricing.put("stockQuantity", batch.getStockQuantity());
        pricing.put("batchCode", batch.getBatchCode());
        pricing.put("expiryDate", batch.getExpiryDate());
        pricing.put("supplierName", batch.getSupplier() != null ? batch.getSupplier().getSupplierName() : null);
        return pricing;
    }

    /**
     * Find all active batches by barcode (for multi-batch products)
     */
    public List<ProductBatchResponse> getAllBatchesByBarcode(String barcode) {
        List<ProductBatch> batches = batchRepository.findActiveByBarcodeOrderByExpiryDate(barcode);
        if (batches.isEmpty()) {
            throw new ResourceNotFoundException("ProductBatch", "barcode", barcode);
        }
        return batches.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /**
     * Deduct stock using barcode (direct FIFO by barcode)
     */
    public void deductStockByBarcodeFIFO(String barcode, Integer quantity,
            String referenceNumber, Integer userId) {

        List<ProductBatch> batches = batchRepository.findActiveByBarcodeOrderByExpiryDate(barcode);
        if (batches.isEmpty()) {
            throw new ResourceNotFoundException("ProductBatch", "barcode", barcode);
        }

        int remainingToDeduct = quantity;

        for (ProductBatch batch : batches) {
            if (remainingToDeduct <= 0)
                break;

            if (batch.getStockQuantity() > 0) {
                int deductFromThisBatch = Math.min(batch.getStockQuantity(), remainingToDeduct);

                int beforeQty = batch.getStockQuantity();
                batch.setStockQuantity(beforeQty - deductFromThisBatch);
                batch.setUpdatedBy(userId);
                batchRepository.save(batch);

                // Log movement
                stockMovementService.logMovement(
                        batch.getBatchId(),
                        StockMovement.MovementType.SALE,
                        -deductFromThisBatch,
                        referenceNumber,
                        "SALE",
                        "Stock deducted via barcode FIFO for sale",
                        userId);

                remainingToDeduct -= deductFromThisBatch;
            }
        }

        if (remainingToDeduct > 0) {
            throw new InsufficientStockException(
                    String.format("Insufficient stock for barcode %s. Required: %d, Available: %d",
                            barcode, quantity, quantity - remainingToDeduct));
        }

        // Update alerts after deduction
        if (!batches.isEmpty()) {
            stockAlertService.checkAndResolveAlertsForProduct(batches.get(0).getProduct().getProductId());
        }
    }

    private String generateBatchCode() {
        String lastCode = batchRepository.findLastBatchCode().orElse(null);
        return CodeGenerator.generateBatchCode(lastCode);
    }

    private String generateBarcodeForBatch() {
        return CodeGenerator.generateBarcode();
    }

    private ProductBatch findById(Integer id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "id", id));
    }

    private ProductBatchResponse toResponse(ProductBatch batch) {
        ProductBatchResponse response = new ProductBatchResponse();
        response.setBatchId(batch.getBatchId());
        response.setBatchCode(batch.getBatchCode());
        response.setBarcode(batch.getBarcode());
        response.setProductId(batch.getProduct().getProductId());
        response.setProductName(batch.getProduct().getProductName());
        response.setProductCode(batch.getProduct().getProductCode());

        if (batch.getSupplier() != null) {
            response.setSupplierId(batch.getSupplier().getSupplierId());
            response.setSupplierName(batch.getSupplier().getSupplierName());
        }

        if (batch.getGrn() != null) {
            response.setGrnNumber(batch.getGrn().getGrnNumber());
        }

        response.setPurchasePrice(batch.getPurchasePrice());
        response.setSellingPrice(batch.getSellingPrice());
        response.setMrp(batch.getMrp());
        response.setStockQuantity(batch.getStockQuantity());
        response.setReceivedQuantity(batch.getReceivedQuantity());
        response.setManufacturedDate(batch.getManufacturedDate());
        response.setExpiryDate(batch.getExpiryDate());

        if (batch.getExpiryDate() != null) {
            long daysUntilExpiry = StockCalculator.getDaysUntilExpiry(batch.getExpiryDate());
            response.setDaysUntilExpiry(
                    daysUntilExpiry > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) daysUntilExpiry);
        }

        response.setReceivedDate(batch.getReceivedDate());
        response.setStatus(batch.getStatus());
        response.setIsActive(batch.getIsActive());

        return response;
    }
}
