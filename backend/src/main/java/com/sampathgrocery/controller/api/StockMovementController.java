package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.product.StockMovementResponse;
import com.sampathgrocery.entity.product.StockMovement.MovementType;
import com.sampathgrocery.service.product.StockMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Stock Movement REST API Controller
 */
@RestController
@RequestMapping("/api/stock-movements")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<ApiResponse<List<StockMovementResponse>>> getMovementsByBatch(
            @PathVariable Integer batchId) {
        List<StockMovementResponse> movements = stockMovementService.getMovementsByBatch(batchId);
        return ResponseEntity.ok(ApiResponse.success(movements));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<StockMovementResponse>>> getMovementsByProduct(
            @PathVariable Integer productId) {
        List<StockMovementResponse> movements = stockMovementService.getMovementsByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(movements));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<StockMovementResponse>>> getMovementsByType(
            @PathVariable MovementType type) {
        List<StockMovementResponse> movements = stockMovementService.getMovementsByType(type);
        return ResponseEntity.ok(ApiResponse.success(movements));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<StockMovementResponse>>> getRecentMovements(
            @RequestParam(defaultValue = "50") int limit) {
        List<StockMovementResponse> movements = stockMovementService.getRecentMovements(limit);
        return ResponseEntity.ok(ApiResponse.success(movements));
    }
}
