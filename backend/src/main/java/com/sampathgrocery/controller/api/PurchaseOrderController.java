package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.supplier.PurchaseOrderRequest;
import com.sampathgrocery.dto.supplier.PurchaseOrderResponse;
import com.sampathgrocery.entity.supplier.PurchaseOrder.POStatus;
import com.sampathgrocery.service.supplier.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Purchase Order REST API Controller
 */
@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;
    private static final Integer CURRENT_USER_ID = 1;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PurchaseOrderResponse>>> getAllPurchaseOrders(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer supplierId,
            @RequestParam(required = false) POStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        List<PurchaseOrderResponse> orders = purchaseOrderService.getAllPurchaseOrders(
                query, supplierId, status, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> getPurchaseOrderById(
            @PathVariable Integer id) {
        PurchaseOrderResponse order = purchaseOrderService.getPurchaseOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequest request) {
        PurchaseOrderResponse order = purchaseOrderService.createPurchaseOrder(request, CURRENT_USER_ID);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase order created successfully", order));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> submitForApproval(
            @PathVariable Integer id) {
        PurchaseOrderResponse order = purchaseOrderService.submitForApproval(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase order submitted for approval", order));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> approvePurchaseOrder(
            @PathVariable Integer id) {
        PurchaseOrderResponse order = purchaseOrderService.approvePurchaseOrder(id, CURRENT_USER_ID);
        return ResponseEntity.ok(ApiResponse.success("Purchase order approved", order));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> rejectPurchaseOrder(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        String reason = payload.getOrDefault("reason", "No reason provided");
        PurchaseOrderResponse order = purchaseOrderService.rejectPurchaseOrder(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Purchase order rejected", order));
    }

    @PostMapping("/{id}/mark-ordered")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> markAsOrdered(
            @PathVariable Integer id) {
        PurchaseOrderResponse order = purchaseOrderService.markAsOrdered(id);
        return ResponseEntity.ok(ApiResponse.success("Purchase order marked as ordered", order));
    }

    @GetMapping("/count/active")
    public ResponseEntity<ApiResponse<Long>> getActivePurchaseOrderCount() {
        long count = purchaseOrderService.countActivePurchaseOrders();
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @GetMapping("/generate-number")
    public ResponseEntity<ApiResponse<String>> generatePONumber() {
        String number = purchaseOrderService.generatePONumber();
        return ResponseEntity.ok(ApiResponse.success(number));
    }
}
