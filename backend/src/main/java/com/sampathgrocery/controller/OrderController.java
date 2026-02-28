package com.sampathgrocery.controller;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.service.order.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Order Controller - REST API endpoints for order management
 * Handles both POS (walk-in) and online order creation and management
 */
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;

    /**
     * Create a new order (POS or Online)
     * POST /api/orders
     */
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderCreateRequest request) {
        log.info("REST: Creating {} order with {} items", request.getOrderType(), request.getItems().size());

        // TODO: Get createdBy from JWT token
        Integer createdBy = 1; // Hardcoded for now

        OrderResponse response = orderService.createOrder(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", response));
    }

    /**
     * Get order by ID
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Integer id) {
        log.info("REST: Getting order ID: {}", id);
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all orders
     * GET /api/orders
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        log.info("REST: Getting all orders");
        List<OrderResponse> response = orderService.getAllOrders();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get orders by customer ID
     * GET /api/orders/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByCustomerId(
            @PathVariable Integer customerId) {
        log.info("REST: Getting orders for customer ID: {}", customerId);
        List<OrderResponse> response = orderService.getOrdersByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update order status
     * PUT /api/orders/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Integer id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        log.info("REST: Updating status for order ID: {}", id);

        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;

        OrderResponse response = orderService.updateOrderStatus(id, request, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }
}
