package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.product.StockAlertResponse;
import com.sampathgrocery.entity.product.StockAlert.AlertType;
import com.sampathgrocery.entity.product.StockAlert.Severity;
import com.sampathgrocery.service.product.StockAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Stock Alert REST API Controller
 */
@RestController
@RequestMapping("/api/stock-alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StockAlertController {

    private final StockAlertService stockAlertService;
    private static final Integer CURRENT_USER_ID = 1;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockAlertResponse>>> getAllAlerts(
            @RequestParam(required = false) AlertType type,
            @RequestParam(required = false) Boolean isResolved,
            @RequestParam(required = false) Severity severity) {

        List<StockAlertResponse> alerts = stockAlertService.getAllAlerts(type, isResolved, severity);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<StockAlertResponse>>> getActiveAlerts() {
        List<StockAlertResponse> alerts = stockAlertService.getAllAlerts(null, false, null);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<StockAlertResponse>>> getAlertsByProduct(
            @PathVariable Integer productId) {
        List<StockAlertResponse> alerts = stockAlertService.getActiveAlertsByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(alerts));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<StockAlertResponse>> resolveAlert(
            @PathVariable Integer id,
            @RequestBody(required = false) Map<String, String> payload) {

        String notes = payload != null ? payload.getOrDefault("notes", "Alert resolved") : "Alert resolved";
        StockAlertResponse alert = stockAlertService.resolveAlert(id, CURRENT_USER_ID, notes);
        return ResponseEntity.ok(ApiResponse.success("Alert resolved successfully", alert));
    }

    @GetMapping("/count/active")
    public ResponseEntity<ApiResponse<Long>> getActiveAlertCount() {
        long count = stockAlertService.getActiveAlertCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/count/critical")
    public ResponseEntity<ApiResponse<Long>> getCriticalAlertCount() {
        long count = stockAlertService.getCriticalAlertCount();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
