package com.sampathgrocery.entity.supplier;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * මිලදී ගැනීමේ ඇණවුම් - Purchase Orders (Reorder Requests)
 * Manages purchase orders sent to suppliers
 */
@Entity
@Table(name = "purchase_order")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Integer requestId;

    @NotBlank(message = "PO number is required")
    @Size(max = 30, message = "PO number cannot exceed 30 characters")
    @Column(name = "request_code", nullable = false, unique = true, length = 30)
    private String poNumber;

    @NotNull(message = "Supplier is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private POStatus status = POStatus.DRAFT;

    @NotNull(message = "Requested date is required")
    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 12, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @NotNull(message = "Requested by user is required")
    @Column(name = "requested_by", nullable = false)
    private Integer requestedBy;

    @Column(name = "approved_by")
    private Integer approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = POStatus.DRAFT;
        }
        if (subtotal == null)
            subtotal = BigDecimal.ZERO;
        if (taxAmount == null)
            taxAmount = BigDecimal.ZERO;
        if (discountAmount == null)
            discountAmount = BigDecimal.ZERO;
        if (grandTotal == null)
            grandTotal = BigDecimal.ZERO;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Purchase Order Status Enum
     */
    public enum POStatus {
        DRAFT, // Being created
        PENDING, // Submitted for approval
        APPROVED, // Approved by manager (ready to receive)
        REJECTED, // Rejected
        ORDERED, // Sent to supplier
        PARTIALLY_RECEIVED, // Some items received (at least one GRN approved)
        RECEIVED, // All items fully received
        CANCELLED // Cancelled
    }
}
