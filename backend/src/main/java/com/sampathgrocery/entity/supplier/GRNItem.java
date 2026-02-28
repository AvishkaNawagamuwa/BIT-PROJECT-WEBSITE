package com.sampathgrocery.entity.supplier;

import com.sampathgrocery.entity.product.Product;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * භාණ්ඩ ලැබීමේ අයිතම - GRN Line Items
 * Individual items received in a GRN
 * CRITICAL: Final purchase prices are set here
 */
@Entity
@Table(name = "grn_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRNItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "grn_item_id")
    private Integer grnItemId;

    @NotNull(message = "GRN is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_id", nullable = false)
    private GRN grn;

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Batch code for this received item
     * Can be auto-generated or manually entered
     */
    @Column(name = "batch_code", length = 50)
    private String batchCode;

    /**
     * Quantity that was ordered (from PO if linked)
     */
    @Column(name = "ordered_quantity")
    private Integer orderedQuantity;

    /**
     * Actual quantity received
     */
    @NotNull(message = "Received quantity is required")
    @Min(value = 1, message = "Received quantity must be at least 1")
    @Column(name = "received_quantity", nullable = false)
    private Integer receivedQuantity;

    /**
     * FINAL confirmed purchase price per unit
     * This is the actual price, not an estimate
     */
    @NotNull(message = "Purchase price is required")
    @Column(name = "purchase_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalPurchasePrice;

    /**
     * Selling price (optional - can be set here or later)
     */
    @Column(name = "selling_price", precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @Column(name = "line_total", precision = 12, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "manufactured_date")
    private LocalDate manufacturedDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // Calculate line total
        if (finalPurchasePrice != null && receivedQuantity != null) {
            lineTotal = finalPurchasePrice.multiply(BigDecimal.valueOf(receivedQuantity));
        }
    }
}
