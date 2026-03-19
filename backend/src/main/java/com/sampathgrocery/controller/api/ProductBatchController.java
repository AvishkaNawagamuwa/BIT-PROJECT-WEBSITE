package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.product.ProductBatchRequest;
import com.sampathgrocery.dto.product.ProductBatchResponse;
import com.sampathgrocery.entity.product.ProductBatch.BatchStatus;
import com.sampathgrocery.exception.InsufficientStockException;
import com.sampathgrocery.service.product.ProductBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Product Batch REST API Controller
 */
@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductBatchController {

    private final ProductBatchService batchService;
    private static final Integer CURRENT_USER_ID = 1;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductBatchResponse>>> getAllBatches(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) BatchStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryTo) {

        List<ProductBatchResponse> batches = batchService.getAllBatches(productId, status, expiryFrom, expiryTo);
        return ResponseEntity.ok(ApiResponse.success(batches));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductBatchResponse>> getBatchById(@PathVariable Integer id) {
        ProductBatchResponse batch = batchService.getBatchById(id);
        return ResponseEntity.ok(ApiResponse.success(batch));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ProductBatchResponse>>> getBatchesByProduct(
            @PathVariable Integer productId) {
        List<ProductBatchResponse> batches = batchService.getBatchesByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(batches));
    }

    @GetMapping("/expiring-soon")
    public ResponseEntity<ApiResponse<List<ProductBatchResponse>>> getExpiringBatches(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate beforeDate) {

        LocalDate date = beforeDate != null ? beforeDate : LocalDate.now().plusDays(30);
        List<ProductBatchResponse> batches = batchService.getExpiringBatches(date);
        return ResponseEntity.ok(ApiResponse.success(batches));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductBatchResponse>> createBatch(
            @Valid @RequestBody ProductBatchRequest request) {
        ProductBatchResponse batch = batchService.createBatch(request, CURRENT_USER_ID);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Batch created successfully", batch));
    }

    @PutMapping("/{id}/selling-price")
    public ResponseEntity<ApiResponse<ProductBatchResponse>> updateSellingPrice(
            @PathVariable Integer id,
            @RequestBody Map<String, BigDecimal> payload) {

        BigDecimal newPrice = payload.get("sellingPrice");
        ProductBatchResponse batch = batchService.updateSellingPrice(id, newPrice, CURRENT_USER_ID);
        return ResponseEntity.ok(ApiResponse.success("Selling price updated", batch));
    }

    @PostMapping("/{id}/adjust-stock")
    public ResponseEntity<ApiResponse<ProductBatchResponse>> adjustStock(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> payload) {

        Integer quantity = (Integer) payload.get("quantity");
        String reason = (String) payload.getOrDefault("reason", "ADJUSTMENT");
        String notes = (String) payload.get("notes");

        ProductBatchResponse batch = batchService.adjustStock(id, quantity, reason, notes, CURRENT_USER_ID);
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted successfully", batch));
    }

    @GetMapping("/total-stock/{productId}")
    public ResponseEntity<ApiResponse<Integer>> getTotalStockByProduct(@PathVariable Integer productId) {
        Integer total = batchService.getTotalStockByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @GetMapping("/total-value")
    public ResponseEntity<ApiResponse<Double>> getTotalStockValue() {
        Double value = batchService.getTotalStockValue();
        return ResponseEntity.ok(ApiResponse.success(value));
    }

    // ===================================
    // BARCODE ENDPOINTS - NEW METHODS
    // ===================================

    /**
     * Get batch details by barcode
     * Returns the active batch with earliest expiry date
     */
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ApiResponse<ProductBatchResponse>> getBatchByBarcode(
            @PathVariable String barcode) {
        ProductBatchResponse batch = batchService.getBatchByBarcode(barcode);
        return ResponseEntity.ok(ApiResponse.success(batch));
    }

    /**
     * Get pricing information by barcode
     * Used for POS/Sales to quickly get unit price, product name, etc.
     */
    @GetMapping("/barcode/{barcode}/pricing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPricingByBarcode(
            @PathVariable String barcode) {
        Map<String, Object> pricing = batchService.getPricingByBarcode(barcode);
        return ResponseEntity.ok(ApiResponse.success("Pricing information retrieved", pricing));
    }

    /**
     * Get all active batches for a barcode (FIFO ordered)
     * Returns all available batches for a product identified by barcode
     */
    @GetMapping("/barcode/{barcode}/all")
    public ResponseEntity<ApiResponse<List<ProductBatchResponse>>> getAllBatchesByBarcode(
            @PathVariable String barcode) {
        List<ProductBatchResponse> batches = batchService.getAllBatchesByBarcode(barcode);
        return ResponseEntity.ok(ApiResponse.success(batches));
    }

    /**
     * Deduct stock using barcode (FIFO)
     * Used for sales/POS - identifies product by barcode and deducts stock
     */
    @PostMapping("/barcode/{barcode}/deduct-stock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deductStockByBarcode(
            @PathVariable String barcode,
            @RequestBody Map<String, Object> payload) {

        Integer quantity = (Integer) payload.get("quantity");
        String referenceNumber = (String) payload.getOrDefault("referenceNumber", "MANUAL");

        if (quantity == null || quantity <= 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Quantity must be greater than 0"));
        }

        try {
            batchService.deductStockByBarcodeFIFO(barcode, quantity, referenceNumber, CURRENT_USER_ID);

            Map<String, Object> result = new java.util.HashMap<>();
            result.put("barcode", barcode);
            result.put("quantityDeducted", quantity);
            result.put("referenceNumber", referenceNumber);
            result.put("message", "Stock deducted successfully using barcode");

            return ResponseEntity.ok(ApiResponse.success("Stock deducted successfully", result));
        } catch (InsufficientStockException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
