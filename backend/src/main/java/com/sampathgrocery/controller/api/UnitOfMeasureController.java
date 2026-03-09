package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.product.UnitOfMeasureRequest;
import com.sampathgrocery.dto.product.UnitOfMeasureResponse;
import com.sampathgrocery.service.product.UnitOfMeasureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Unit of Measure API Controller
 */
@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitOfMeasureController {

    private final UnitOfMeasureService unitOfMeasureService;

    /**
     * Get all units
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UnitOfMeasureResponse>>> getAllUnits() {
        List<UnitOfMeasureResponse> units = unitOfMeasureService.getAllUnits();
        return ResponseEntity.ok(ApiResponse.success(units));
    }

    /**
     * Get all active units
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<UnitOfMeasureResponse>>> getAllActiveUnits() {
        List<UnitOfMeasureResponse> units = unitOfMeasureService.getAllActiveUnits();
        return ResponseEntity.ok(ApiResponse.success(units));
    }

    /**
     * Get unit by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitOfMeasureResponse>> getUnitById(@PathVariable Integer id) {
        UnitOfMeasureResponse unit = unitOfMeasureService.getUnitById(id);
        return ResponseEntity.ok(ApiResponse.success(unit));
    }

    /**
     * Create new unit
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UnitOfMeasureResponse>> createUnit(
            @Valid @RequestBody UnitOfMeasureRequest request,
            @RequestParam(required = false, defaultValue = "1") Integer createdBy) {
        UnitOfMeasureResponse unit = unitOfMeasureService.createUnit(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Unit created successfully", unit));
    }

    /**
     * Update unit
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UnitOfMeasureResponse>> updateUnit(
            @PathVariable Integer id,
            @Valid @RequestBody UnitOfMeasureRequest request,
            @RequestParam(required = false, defaultValue = "1") Integer updatedBy) {
        UnitOfMeasureResponse unit = unitOfMeasureService.updateUnit(id, request, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Unit updated successfully", unit));
    }

    /**
     * Delete unit
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUnit(@PathVariable Integer id) {
        unitOfMeasureService.deleteUnit(id);
        return ResponseEntity.ok(ApiResponse.success("Unit deleted successfully", null));
    }

    /**
     * Toggle unit status
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UnitOfMeasureResponse>> toggleStatus(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "1") Integer updatedBy) {
        UnitOfMeasureResponse unit = unitOfMeasureService.toggleUnitStatus(id, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Unit status updated successfully", unit));
    }
}
