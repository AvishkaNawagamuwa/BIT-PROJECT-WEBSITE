package com.sampathgrocery.controller;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.customer.*;
import com.sampathgrocery.service.customer.CustomerProfileService;
import com.sampathgrocery.service.customer.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Customer Controller - REST API endpoints for customer management
 * Handles customer CRUD, profile management, and loyalty operations
 */
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@Slf4j
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerProfileService profileService;

    /**
     * Create a new customer
     * POST /api/customers
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @Valid @RequestBody CustomerCreateRequest request) {
        log.info("REST: Creating customer - {}", request.getFullName());

        // TODO: Get createdBy from JWT token
        Integer createdBy = 1; // Hardcoded for now

        CustomerResponse response = customerService.createCustomer(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer created successfully", response));
    }

    /**
     * Update customer
     * PUT /api/customers/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable Integer id,
            @Valid @RequestBody CustomerUpdateRequest request) {
        log.info("REST: Updating customer ID: {}", id);

        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;

        CustomerResponse response = customerService.updateCustomer(id, request, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Customer updated successfully", response));
    }

    /**
     * Get customer by ID
     * GET /api/customers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Integer id) {
        log.info("REST: Getting customer ID: {}", id);
        CustomerResponse response = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all customers
     * GET /api/customers
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> getAllCustomers() {
        log.info("REST: Getting all customers");
        List<CustomerResponse> response = customerService.getAllCustomers();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Search customers
     * GET /api/customers/search?q=search_term
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> searchCustomers(
            @RequestParam(required = false) String q) {
        log.info("REST: Searching customers with term: {}", q);
        List<CustomerResponse> response = customerService.searchCustomers(q, null);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Delete customer
     * DELETE /api/customers/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Integer id) {
        log.info("REST: Deleting customer ID: {}", id);
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted successfully", null));
    }

    // ==================== LOYALTY OPERATIONS ====================

    /**
     * Add loyalty points to customer
     * POST /api/customers/{id}/loyalty/add
     */
    @PostMapping("/{id}/loyalty/add")
    public ResponseEntity<ApiResponse<CustomerResponse>> addLoyaltyPoints(
            @PathVariable Integer id,
            @RequestParam Integer points) {
        log.info("REST: Adding {} loyalty points to customer ID: {}", points, id);
        CustomerResponse response = customerService.addLoyaltyPoints(id, points);
        return ResponseEntity.ok(ApiResponse.success("Loyalty points added successfully", response));
    }

    /**
     * Redeem loyalty points
     * POST /api/customers/{id}/loyalty/redeem
     */
    @PostMapping("/{id}/loyalty/redeem")
    public ResponseEntity<ApiResponse<LoyaltyRedemptionResponse>> redeemLoyaltyPoints(
            @PathVariable Integer id,
            @Valid @RequestBody LoyaltyRedemptionRequest request) {
        log.info("REST: Redeeming {} loyalty points for customer ID: {}", request.getPointsToRedeem(), id);
        LoyaltyRedemptionResponse response = customerService.redeemLoyaltyPoints(id, request);
        return ResponseEntity.ok(ApiResponse.success("Loyalty points redeemed successfully", response));
    }

    // ==================== CUSTOMER PROFILE OPERATIONS ====================

    /**
     * Get customer profile
     * GET /api/customers/{id}/profile
     */
    @GetMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getCustomerProfile(@PathVariable Integer id) {
        log.info("REST: Getting profile for customer ID: {}", id);
        CustomerProfileResponse response = profileService.getProfileByCustomerId(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update customer profile
     * PUT /api/customers/{id}/profile
     */
    @PutMapping("/{id}/profile")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> updateCustomerProfile(
            @PathVariable Integer id,
            @Valid @RequestBody CustomerProfileUpdateRequest request) {
        log.info("REST: Updating profile for customer ID: {}", id);

        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;

        CustomerProfileResponse response = profileService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.success("Customer profile updated successfully", response));
    }
}
