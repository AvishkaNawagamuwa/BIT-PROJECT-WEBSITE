package com.sampathgrocery.controller;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.order.InvoiceResponse;
import com.sampathgrocery.service.order.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Invoice Controller - REST API endpoints for invoice management
 * Handles invoice generation, status updates, and invoice retrieval
 */
@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Slf4j
public class InvoiceController {

    private final InvoiceService invoiceService;

    /**
     * Generate invoice for an order
     * POST /api/invoices/generate/{orderId}
     */
    @PostMapping("/generate/{orderId}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> generateInvoice(@PathVariable Integer orderId) {
        log.info("REST: Generating invoice for order ID: {}", orderId);

        // TODO: Get createdBy from JWT token
        Integer createdBy = 1; // Hardcoded for now

        InvoiceResponse response = invoiceService.generateInvoice(orderId, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invoice generated successfully", response));
    }

    /**
     * Get invoice by ID
     * GET /api/invoices/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(@PathVariable Integer id) {
        log.info("REST: Getting invoice ID: {}", id);
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get invoice by invoice number
     * GET /api/invoices/number/{invoiceNumber}
     */
    @GetMapping("/number/{invoiceNumber}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByNumber(
            @PathVariable String invoiceNumber) {
        log.info("REST: Getting invoice by number: {}", invoiceNumber);
        InvoiceResponse response = invoiceService.getInvoiceByNumber(invoiceNumber);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get invoice by order ID
     * GET /api/invoices/order/{orderId}
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByOrderId(
            @PathVariable Integer orderId) {
        log.info("REST: Getting invoice for order ID: {}", orderId);
        InvoiceResponse response = invoiceService.getInvoiceByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get all invoices
     * GET /api/invoices
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices() {
        log.info("REST: Getting all invoices");
        List<InvoiceResponse> response = invoiceService.getAllInvoices();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get overdue invoices
     * GET /api/invoices/overdue
     */
    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getOverdueInvoices() {
        log.info("REST: Getting overdue invoices");
        List<InvoiceResponse> response = invoiceService.getOverdueInvoices();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Update invoice status
     * PUT /api/invoices/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<InvoiceResponse>> updateInvoiceStatus(
            @PathVariable Integer id,
            @RequestParam String status) {
        log.info("REST: Updating invoice {} status to {}", id, status);

        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;

        InvoiceResponse response = invoiceService.updateInvoiceStatus(id, status, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Invoice status updated successfully", response));
    }

    /**
     * Mark invoice as paid
     * PUT /api/invoices/{id}/mark-paid
     */
    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<ApiResponse<InvoiceResponse>> markInvoiceAsPaid(@PathVariable Integer id) {
        log.info("REST: Marking invoice {} as paid", id);

        // TODO: Get updatedBy from JWT token
        Integer updatedBy = 1;

        InvoiceResponse response = invoiceService.markInvoiceAsPaid(id, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Invoice marked as paid successfully", response));
    }
}
