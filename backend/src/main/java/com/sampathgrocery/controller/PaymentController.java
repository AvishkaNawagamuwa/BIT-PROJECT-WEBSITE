package com.sampathgrocery.controller;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.service.order.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Payment Controller - REST API endpoints for payment management
 * Handles payment creation, status updates, and payment tracking
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Create a new payment
     * POST /api/payments
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @RequestBody PaymentCreateRequest request) {
        log.info("REST: Creating payment for order ID: {}", request.getOrderId());

        // TODO: Get createdBy from JWT token
        Integer createdBy = 1; // Hardcoded for now

        PaymentResponse response = paymentService.createPayment(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment created successfully", response));
    }

    /**
     * Get payment by ID
     * GET /api/payments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Integer id) {
        log.info("REST: Getting payment ID: {}", id);
        PaymentResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all payments for an order
     * GET /api/payments/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByOrderId(
            @PathVariable Integer orderId) {
        log.info("REST: Getting payments for order ID: {}", orderId);
        List<PaymentResponse> response = paymentService.getPaymentsByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Complete a payment (mark as successful)
     * PUT /api/payments/{id}/complete
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<PaymentResponse>> completePayment(
            @PathVariable Integer id,
            @RequestParam(required = false) String transactionId) {
        log.info("REST: Completing payment ID: {}", id);

        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;

        PaymentResponse response = paymentService.completePayment(id, transactionId, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Payment completed successfully", response));
    }

    /**
     * Fail a payment (mark as failed)
     * PUT /api/payments/{id}/fail
     */
    @PutMapping("/{id}/fail")
    public ResponseEntity<ApiResponse<PaymentResponse>> failPayment(
            @PathVariable Integer id,
            @RequestParam(required = false) String failureReason) {
        log.info("REST: Failing payment ID: {}", id);

        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;

        PaymentResponse response = paymentService.failPayment(id, failureReason, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Payment marked as failed", response));
    }

    /**
     * Refund a payment
     * PUT /api/payments/{id}/refund
     */
    @PutMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(
            @PathVariable Integer id,
            @RequestParam(required = false) String refundReason) {
        log.info("REST: Refunding payment ID: {}", id);

        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;

        PaymentResponse response = paymentService.refundPayment(id, refundReason, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Payment refunded successfully", response));
    }
}
