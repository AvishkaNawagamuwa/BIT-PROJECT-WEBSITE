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
 * භාණ්ඩ ලැබීමේ සටහන - Goods Received Note
 * Records all goods received from suppliers
 * CRITICAL: This is where final prices and batches are confirmed
 */
@Entity
@Table(name = "grn")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRN {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grn_id")
    private Integer grnId;

    @NotBlank(message = "GRN number is required")
    @Size(max = 30, message = "GRN number cannot exceed 30 characters")
    @Column(name = "grn_number", nullable = false, unique = true, length = 30)
    private String grnNumber;

    /**
     * Linked purchase order (optional - can receive goods without PO)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private PurchaseOrder purchaseOrder;

    @NotNull(message = "Supplier is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @NotNull(message = "Received date is required")
    @Column(name = "received_date", nullable = false)
    private LocalDate receivedDate;

    @Size(max = 100, message = "Invoice number cannot exceed 100 characters")
    @Column(name = "invoice_number", length = 100)
    private String invoiceNumber;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 12, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "quality_status", length = 20)
    private QualityStatus qualityStatus = QualityStatus.OK;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private GRNStatus status = GRNStatus.RECEIVED;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @NotNull(message = "Received by user is required")
    @Column(name = "received_by", nullable = false)
    private Integer receivedBy;

    @Column(name = "verified_by")
    private Integer verifiedBy;

    // Audit fields
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private Integer createdBy;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Integer updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = GRNStatus.RECEIVED;
        }
        if (qualityStatus == null) {
            qualityStatus = QualityStatus.OK;
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
     * GRN Status Enum
     */
    public enum GRNStatus {
        RECEIVED, // Goods fully received - PO completed
        PARTIALLY_RECEIVED // Partial delivery - PO still has remaining items
    }

    /**
     * Quality Status Enum
     */
    public enum QualityStatus {
        OK, // All goods in good condition
        ISSUES // Some items have issues (damaged/missing/etc)
    }
}
