package com.sampathgrocery.controller.delivery;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.delivery.DriverRequest;
import com.sampathgrocery.dto.delivery.DriverResponse;
import com.sampathgrocery.service.delivery.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Driver operations
 */
@RestController
@RequestMapping("/api/v1/delivery/drivers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverController {

    private final DriverService driverService;

    /**
     * Get all drivers
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAllDrivers() {
        List<DriverResponse> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Drivers retrieved successfully", drivers));
    }

    /**
     * Get all active drivers
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getActiveDrivers() {
        List<DriverResponse> drivers = driverService.getActiveDrivers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Active drivers retrieved successfully", drivers));
    }

    /**
     * Get driver by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponse>> getDriverById(@PathVariable Integer id) {
        DriverResponse driver = driverService.getDriverById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver retrieved successfully", driver));
    }

    /**
     * Get driver by code
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<DriverResponse>> getDriverByCode(@PathVariable String code) {
        DriverResponse driver = driverService.getDriverByCode(code);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver retrieved successfully", driver));
    }

    /**
     * Create new driver
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DriverResponse>> createDriver(
            @Valid @RequestBody DriverRequest request,
            @RequestHeader(value = "User-Id", required = false) Integer userId) {
        DriverResponse driver = driverService.createDriver(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Driver created successfully", driver));
    }

    /**
     * Update driver
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DriverResponse>> updateDriver(
            @PathVariable Integer id,
            @Valid @RequestBody DriverRequest request,
            @RequestHeader(value = "User-Id", required = false) Integer userId) {
        DriverResponse driver = driverService.updateDriver(id, request, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver updated successfully", driver));
    }

    /**
     * Delete driver
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(@PathVariable Integer id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver deleted successfully", null));
    }

    /**
     * Toggle driver active status
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<DriverResponse>> toggleDriverStatus(
            @PathVariable Integer id,
            @RequestHeader(value = "User-Id", required = false) Integer userId) {
        DriverResponse driver = driverService.toggleDriverStatus(id, userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Driver status updated successfully", driver));
    }
}
