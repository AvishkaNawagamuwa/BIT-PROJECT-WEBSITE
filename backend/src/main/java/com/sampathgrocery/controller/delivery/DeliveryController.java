package com.sampathgrocery.controller.delivery;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.delivery.*;
import com.sampathgrocery.entity.delivery.DeliveryStatus;
import com.sampathgrocery.service.delivery.DeliveryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST Controller for Delivery management
 */
@RestController
@RequestMapping("/api/v1/delivery/deliveries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryService deliveryService;

    /**
     * Create a new delivery
     * POST /api/v1/delivery/deliveries
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DeliveryResponse>> createDelivery(@Valid @RequestBody DeliveryRequest request) {
        DeliveryResponse response = deliveryService.createDelivery(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Delivery created successfully", response));
    }

    /**
     * Get all deliveries with pagination and filters
     * GET /api/v1/delivery/deliveries?page=&size=&status=&date=
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<DeliveryResponse>>> getAllDeliveries(
            @RequestParam(required = false) DeliveryStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<DeliveryResponse> deliveries = deliveryService.getAllDeliveries(status, date, pageable);

        return ResponseEntity.ok(ApiResponse.success("Deliveries retrieved successfully", deliveries));
    }

    /**
     * Get delivery by ID
     * GET /api/v1/delivery/deliveries/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryById(@PathVariable Integer id) {
        DeliveryResponse delivery = deliveryService.getDeliveryById(id);
        return ResponseEntity.ok(ApiResponse.success("Delivery retrieved successfully", delivery));
    }

    /**
     * Assign driver and vehicle to delivery
     * PATCH /api/v1/delivery/deliveries/{id}/assign
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<DeliveryResponse>> assignDelivery(
            @PathVariable Integer id,
            @Valid @RequestBody AssignDeliveryRequest request) {

        DeliveryResponse response = deliveryService.assignDelivery(id, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery assigned successfully", response));
    }

    /**
     * Update delivery status
     * PATCH /api/v1/delivery/deliveries/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateDeliveryStatusRequest request) {

        DeliveryResponse response = deliveryService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery status updated successfully", response));
    }

    /**
     * Update proof of delivery
     * PATCH /api/v1/delivery/deliveries/{id}/proof
     */
    @PatchMapping("/{id}/proof")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateProof(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateProofRequest request) {

        DeliveryResponse response = deliveryService.updateProof(id, request);
        return ResponseEntity.ok(ApiResponse.success("Proof of delivery updated successfully", response));
    }
}
