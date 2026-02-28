package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.product.ProductBatchRequest;
import com.sampathgrocery.dto.product.ProductBatchResponse;
import com.sampathgrocery.entity.product.ProductBatch.BatchStatus;
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
}
