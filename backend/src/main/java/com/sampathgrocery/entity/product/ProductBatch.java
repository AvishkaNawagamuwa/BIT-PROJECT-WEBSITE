package com.sampathgrocery.entity.product;

import com.sampathgrocery.entity.supplier.GRN;
import com.sampathgrocery.entity.supplier.GRNItem;
import com.sampathgrocery.entity.supplier.Supplier;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
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
 * නිෂ්පාදන තොගය - Product Batches
 * Batch-wise inventory tracking with expiry dates
 * Created automatically when GRN is approved
 */
@Entity
@Table(name = "product_batch")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_id")
    private Integer batchId;

    @NotBlank(message = "Batch code is required")
    @Size(max = 30, message = "Batch code cannot exceed 30 characters")
    @Column(name = "batch_code", nullable = false, unique = true, length = 30)
    private String batchCode;

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * GRN that created this batch
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_id")
    private GRN grn;

    /**
     * Specific GRN item that created this batch
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_item_id")
    private GRNItem grnItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @NotNull(message = "Purchase price is required")
    @Column(name = "purchase_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @NotNull(message = "Selling price is required")
    @Column(name = "selling_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "mrp", precision = 10, scale = 2)
    private BigDecimal mrp;

    /**
     * Current available stock quantity
     */
    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity cannot be negative")
    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    /**
     * Original quantity received
     */
    @NotNull(message = "Received quantity is required")
    @Column(name = "received_quantity", nullable = false)
    private Integer receivedQuantity;

    @Column(name = "manufactured_date")
    private LocalDate manufacturedDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @NotNull(message = "Received date is required")
    @Column(name = "received_date", nullable = false)
    private LocalDate receivedDate;

    /**
     * Batch status for workflow tracking
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private BatchStatus status = BatchStatus.RECEIVED;

    @Column(name = "is_active")
    private Boolean isActive = true;

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
        if (isActive == null) {
            isActive = true;
        }
        if (status == null) {
            status = BatchStatus.RECEIVED;
        }
        if (stockQuantity == null) {
            stockQuantity = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Batch Status Enum
     */
    public enum BatchStatus {
        PENDING_RECEIVE, // Ordered but not yet received
        RECEIVED, // Received and verified
        IN_STOCK, // In stock and available
        APPROVED // Approved and in inventory
    }
}
