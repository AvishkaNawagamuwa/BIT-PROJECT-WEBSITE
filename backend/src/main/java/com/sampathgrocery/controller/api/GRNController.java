package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.supplier.GRNDashboardStats;
import com.sampathgrocery.dto.supplier.GRNRequest;
import com.sampathgrocery.dto.supplier.GRNResponse;
import com.sampathgrocery.dto.supplier.WaitingPOResponse;
import com.sampathgrocery.entity.supplier.GRN.GRNStatus;
import com.sampathgrocery.service.supplier.GRNService;
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
 * GRN (Goods Received Note) REST API Controller
 */
@RestController
@RequestMapping("/api/grns")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GRNController {

    private final GRNService grnService;
    private static final Integer CURRENT_USER_ID = 1;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GRNResponse>>> getAllGRNs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer supplierId,
            @RequestParam(required = false) GRNStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {

        List<GRNResponse> grns = grnService.getAllGRNs(query, supplierId, status, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(grns));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GRNResponse>> getGRNById(@PathVariable Integer id) {
        GRNResponse grn = grnService.getGRNById(id);
        return ResponseEntity.ok(ApiResponse.success(grn));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GRNResponse>> createGRN(
            @Valid @RequestBody GRNRequest request) {
        GRNResponse grn = grnService.createGRN(request, CURRENT_USER_ID);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("GRN created successfully", grn));
    }

    @PostMapping("/from-po/{poId}")
    public ResponseEntity<ApiResponse<GRNResponse>> createGRNFromPO(@PathVariable Integer poId) {
        GRNResponse grn = grnService.createGRNFromPO(poId, CURRENT_USER_ID);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("GRN created from purchase order", grn));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GRNResponse>> updateDraftGRN(
            @PathVariable Integer id,
            @Valid @RequestBody GRNRequest request) {
        GRNResponse grn = grnService.updateDraftGRN(id, request, CURRENT_USER_ID);
        return ResponseEntity.ok(ApiResponse.success("Draft GRN updated successfully", grn));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<ApiResponse<GRNResponse>> receiveGRN(@PathVariable Integer id) {
        GRNResponse grn = grnService.receiveGRN(id);
        return ResponseEntity.ok(ApiResponse.success("GRN marked as received", grn));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<GRNResponse>> approveGRN(@PathVariable Integer id) {
        GRNResponse grn = grnService.approveGRN(id, CURRENT_USER_ID);
        return ResponseEntity.ok(ApiResponse.success(
                "GRN approved successfully. Inventory updated and batches created.", grn));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<GRNResponse>> rejectGRN(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload) {
        String reason = payload.getOrDefault("reason", "No reason provided");
        GRNResponse grn = grnService.rejectGRN(id, reason);
        return ResponseEntity.ok(ApiResponse.success("GRN rejected", grn));
    }

    @GetMapping("/total-purchase-value")
    public ResponseEntity<ApiResponse<Double>> getTotalPurchaseValue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        Double total = grnService.getTotalPurchaseValue(fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(total));
    }

    @GetMapping("/generate-number")
    public ResponseEntity<ApiResponse<String>> generateGRNNumber() {
        String number = grnService.generateGRNNumber();
        return ResponseEntity.ok(ApiResponse.success(number));
    }

    /**
     * Get list of POs waiting to be received (for GRN dashboard)
     */
    @GetMapping("/waiting-pos")
    public ResponseEntity<ApiResponse<List<WaitingPOResponse>>> getWaitingPOs() {
        List<WaitingPOResponse> waitingPOs = grnService.getWaitingPOs();
        return ResponseEntity.ok(ApiResponse.success(waitingPOs));
    }

    /**
     * Get dashboard statistics for GRN Records tab
     */
    @GetMapping("/dashboard-stats")
    public ResponseEntity<ApiResponse<GRNDashboardStats>> getDashboardStats() {
        GRNDashboardStats stats = grnService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}
