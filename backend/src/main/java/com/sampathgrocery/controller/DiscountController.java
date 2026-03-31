package com.sampathgrocery.controller;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.service.order.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Discount Controller - REST API endpoints for comprehensive discount
 * management
 * Handles CRUD operations, validation, and active discount retrieval
 */
@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
@Slf4j
public class DiscountController {

    private final DiscountService discountService;

    // ========== CREATE OPERATIONS ==========

    /**
     * Create a new discount configuration
     * POST /api/discounts
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DiscountResponse>> createDiscount(
            @Valid @RequestBody DiscountCreateRequest request) {
        log.info("REST: Creating new discount: {}", request.getDiscountCode());
        // TODO: Get createdBy from JWT token
        Integer createdBy = 1;
        DiscountResponse response = discountService.createDiscount(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Discount created successfully", response));
    }

    // ========== READ OPERATIONS ==========

    /**
     * Get all discounts
     * GET /api/discounts
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DiscountResponse>>> getAllDiscounts() {
        log.info("REST: Getting all discounts");
        List<DiscountResponse> response = discountService.getAllDiscounts();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get discount by ID
     * GET /api/discounts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DiscountResponse>> getDiscountById(@PathVariable Integer id) {
        log.info("REST: Getting discount ID: {}", id);
        DiscountResponse response = discountService.getDiscountById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get discount by code
     * GET /api/discounts/code/{code}
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<DiscountResponse>> getDiscountByCode(@PathVariable String code) {
        log.info("REST: Getting discount by code: {}", code);
        DiscountResponse response = discountService.getDiscountByCode(code);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all active discounts (within date range and enabled)
     * GET /api/discounts/active/list
     */
    @GetMapping("/active/list")
    public ResponseEntity<ApiResponse<List<DiscountResponse>>> getActiveDiscounts() {
        log.info("REST: Getting all active discounts");
        List<DiscountResponse> response = discountService.getActiveDiscounts();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get discounts by category
     * GET /api/discounts/category/{category}
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<DiscountResponse>>> getDiscountsByCategory(
            @PathVariable String category) {
        log.info("REST: Getting discounts by category: {}", category);
        List<DiscountResponse> response = discountService.getDiscountsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ========== UPDATE OPERATIONS ==========

    /**
     * Update an existing discount
     * PUT /api/discounts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DiscountResponse>> updateDiscount(
            @PathVariable Integer id,
            @Valid @RequestBody DiscountUpdateRequest request) {
        log.info("REST: Updating discount ID: {}", id);
        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;
        DiscountResponse response = discountService.updateDiscount(id, request, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Discount updated successfully", response));
    }

    /**
     * Toggle discount active/inactive status
     * PATCH /api/discounts/{id}/toggle-status
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<DiscountResponse>> toggleDiscountStatus(@PathVariable Integer id) {
        log.info("REST: Toggling discount status for ID: {}", id);
        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;
        DiscountResponse response = discountService.toggleDiscountStatus(id, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Discount status toggled", response));
    }

    /**
     * Deactivate a discount
     * PUT /api/discounts/{id}/deactivate
     */
    @PutMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<DiscountResponse>> deactivateDiscount(@PathVariable Integer id) {
        log.info("REST: Deactivating discount ID: {}", id);
        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;
        DiscountResponse response = discountService.deactivateDiscount(id, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Discount deactivated successfully", response));
    }

    /**
     * Activate a discount
     * PUT /api/discounts/{id}/activate
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<DiscountResponse>> activateDiscount(@PathVariable Integer id) {
        log.info("REST: Activating discount ID: {}", id);
        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;
        DiscountResponse response = discountService.activateDiscount(id, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Discount activated successfully", response));
    }

    // ========== DELETE OPERATIONS ==========

    /**
     * Delete a discount
     * DELETE /api/discounts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteDiscount(@PathVariable Integer id) {
        log.info("REST: Deleting discount ID: {}", id);
        discountService.deleteDiscount(id);
        return ResponseEntity.ok(ApiResponse.success("Discount deleted successfully"));
    }

    // ========== VALIDATION OPERATIONS ==========

    /**
     * Validate a discount code for checkout
     * POST /api/discounts/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<DiscountValidationResponse>> validateDiscount(
            @Valid @RequestBody DiscountValidationRequest request) {
        log.info("REST: Validating discount code: {}", request.getDiscountCode());
        DiscountValidationResponse response = discountService.validateDiscount(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
