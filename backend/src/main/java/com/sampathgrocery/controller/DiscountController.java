package com.sampathgrocery.controller;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.service.order.DiscountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Discount Controller - REST API endpoints for discount management
 * Handles discount validation, CRUD operations, and active discount retrieval
 */
@RestController
@RequestMapping("/api/discounts")
@RequiredArgsConstructor
@Slf4j
public class DiscountController {

    private final DiscountService discountService;

    /**
     * Validate a discount code
     * POST /api/discounts/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<DiscountValidationResponse>> validateDiscount(
            @Valid @RequestBody DiscountValidationRequest request) {
        log.info("REST: Validating discount code: {}", request.getDiscountCode());
        DiscountValidationResponse response = discountService.validateDiscount(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all active discounts
     * GET /api/discounts/active
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DiscountResponse>>> getActiveDiscounts() {
        log.info("REST: Getting all active discounts");
        List<DiscountResponse> response = discountService.getActiveDiscounts();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

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
     * Deactivate discount
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
}
