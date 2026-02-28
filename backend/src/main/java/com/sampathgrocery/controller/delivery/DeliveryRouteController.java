package com.sampathgrocery.controller.delivery;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.delivery.*;
import com.sampathgrocery.service.delivery.DeliveryRouteService;
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
import java.util.List;

/**
 * REST Controller for Delivery Route management
 */
@RestController
@RequestMapping("/api/v1/delivery/routes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeliveryRouteController {

    private final DeliveryRouteService routeService;

    /**
     * Create a new delivery route
     * POST /api/v1/delivery/routes
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DeliveryRouteResponse>> createRoute(
            @Valid @RequestBody DeliveryRouteRequest request) {
        DeliveryRouteResponse response = routeService.createRoute(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Route created successfully", response));
    }

    /**
     * Get all routes with pagination and date filter
     * GET /api/v1/delivery/routes?page=&size=&date=
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<DeliveryRouteResponse>>> getAllRoutes(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("routeDate").descending());
        Page<DeliveryRouteResponse> routes = routeService.getAllRoutes(date, pageable);

        return ResponseEntity.ok(ApiResponse.success("Routes retrieved successfully", routes));
    }

    /**
     * Get route by ID
     * GET /api/v1/delivery/routes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryRouteResponse>> getRouteById(@PathVariable Integer id) {
        DeliveryRouteResponse route = routeService.getRouteById(id);
        return ResponseEntity.ok(ApiResponse.success("Route retrieved successfully", route));
    }

    /**
     * Update route
     * PUT /api/v1/delivery/routes/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DeliveryRouteResponse>> updateRoute(
            @PathVariable Integer id,
            @Valid @RequestBody DeliveryRouteRequest request) {

        DeliveryRouteResponse response = routeService.updateRoute(id, request);
        return ResponseEntity.ok(ApiResponse.success("Route updated successfully", response));
    }

    /**
     * Delete route
     * DELETE /api/v1/delivery/routes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Integer id) {
        routeService.deleteRoute(id);
        return ResponseEntity.ok(ApiResponse.success("Route deleted successfully", null));
    }

    /**
     * Update route status
     * PATCH /api/v1/delivery/routes/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<DeliveryRouteResponse>> updateRouteStatus(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateRouteStatusRequest request) {

        DeliveryRouteResponse response = routeService.updateRouteStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Route status updated successfully", response));
    }

    /**
     * Add delivery to route
     * POST /api/v1/delivery/routes/{id}/add-delivery
     */
    @PostMapping("/{id}/add-delivery")
    public ResponseEntity<ApiResponse<DeliveryRouteResponse>> addDeliveryToRoute(
            @PathVariable Integer id,
            @Valid @RequestBody AddDeliveryToRouteRequest request) {

        DeliveryRouteResponse response = routeService.addDeliveryToRoute(id, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery added to route successfully", response));
    }

    /**
     * Remove delivery from route
     * POST /api/v1/delivery/routes/{id}/remove-delivery
     */
    @PostMapping("/{id}/remove-delivery")
    public ResponseEntity<ApiResponse<DeliveryRouteResponse>> removeDeliveryFromRoute(
            @PathVariable Integer id,
            @Valid @RequestBody RemoveDeliveryFromRouteRequest request) {

        DeliveryRouteResponse response = routeService.removeDeliveryFromRoute(id, request);
        return ResponseEntity.ok(ApiResponse.success("Delivery removed from route successfully", response));
    }

    /**
     * Get route items (deliveries in route)
     * GET /api/v1/delivery/routes/{id}/items
     */
    @GetMapping("/{id}/items")
    public ResponseEntity<ApiResponse<List<DeliveryRouteItemResponse>>> getRouteItems(@PathVariable Integer id) {
        List<DeliveryRouteItemResponse> items = routeService.getRouteItems(id);
        return ResponseEntity.ok(ApiResponse.success("Route items retrieved successfully", items));
    }
}
