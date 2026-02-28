package com.sampathgrocery.controller.delivery;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.delivery.VehicleRequest;
import com.sampathgrocery.dto.delivery.VehicleResponse;
import com.sampathgrocery.entity.delivery.VehicleType;
import com.sampathgrocery.service.delivery.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Vehicle management
 */
@RestController
@RequestMapping("/api/v1/delivery/vehicles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;

    /**
     * Create a new vehicle
     * POST /api/v1/delivery/vehicles
     */
    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = vehicleService.createVehicle(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle created successfully", response));
    }

    /**
     * Get all vehicles with pagination and type filter
     * GET /api/v1/delivery/vehicles?page=&size=&type=
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<VehicleResponse>>> getAllVehicles(
            @RequestParam(required = false) VehicleType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<VehicleResponse> vehicles = vehicleService.getAllVehicles(type, pageable);

        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehicles));
    }

    /**
     * Get vehicle by ID
     * GET /api/v1/delivery/vehicles/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Integer id) {
        VehicleResponse vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved successfully", vehicle));
    }

    /**
     * Update vehicle
     * PUT /api/v1/delivery/vehicles/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Integer id,
            @Valid @RequestBody VehicleRequest request) {

        VehicleResponse response = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", response));
    }

    /**
     * Activate vehicle
     * PATCH /api/v1/delivery/vehicles/{id}/activate
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<VehicleResponse>> activateVehicle(@PathVariable Integer id) {
        VehicleResponse response = vehicleService.activateVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle activated successfully", response));
    }

    /**
     * Deactivate vehicle
     * PATCH /api/v1/delivery/vehicles/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<VehicleResponse>> deactivateVehicle(@PathVariable Integer id) {
        VehicleResponse response = vehicleService.deactivateVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deactivated successfully", response));
    }

    /**
     * Delete vehicle (soft delete by deactivating)
     * DELETE /api/v1/delivery/vehicles/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Integer id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully", null));
    }
}
