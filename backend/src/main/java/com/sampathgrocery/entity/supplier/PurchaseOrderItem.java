package com.sampathgrocery.entity.supplier;

import com.sampathgrocery.entity.product.Product;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * මිලදී ගැනීම් අයිතම - Purchase Order Line Items
 * Individual items in a purchase order
 */
@Entity
@Table(name = "reorder_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reorder_item_id")
    private Integer reorderItemId;

    @NotNull(message = "Purchase order is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @NotNull(message = "Product is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    /**
     * Cumulative quantity received across all GRNs
     * Updated when GRN is approved
     */
    @Column(name = "received_quantity", nullable = false)
    private Integer receivedQuantity = 0;

    /**
     * Expected unit price - optional estimate only
     * Final price confirmed at GRN time
     */
    @Column(name = "unit_price", precision = 10, scale = 2)
    private BigDecimal expectedUnitPrice;

    @Column(name = "line_total", precision = 12, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        // Calculate line total if unit price is provided
        if (expectedUnitPrice != null && quantity != null) {
            lineTotal = expectedUnitPrice.multiply(BigDecimal.valueOf(quantity));
        }
    }
}
