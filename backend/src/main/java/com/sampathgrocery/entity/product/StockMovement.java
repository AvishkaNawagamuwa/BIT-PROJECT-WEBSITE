package com.sampathgrocery.entity.product;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * තොග චලනය - Stock Movement Audit Trail
 * Tracks all stock movements (IN/OUT) for complete audit trail
 */
@Entity
@Table(name = "stock_movement")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movement_id")
    private Integer movementId;

    @NotNull(message = "Batch is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private ProductBatch batch;

    @NotNull(message = "Movement type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "movement_type", nullable = false, length = 20)
    private MovementType movementType;

    /**
     * Quantity change (positive for IN, negative for OUT)
     */
    @NotNull(message = "Quantity is required")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "before_quantity", nullable = false)
    private Integer beforeQuantity;

    @Column(name = "after_quantity", nullable = false)
    private Integer afterQuantity;

    @Size(max = 50, message = "Reference number cannot exceed 50 characters")
    @Column(name = "reference_number", length = 50)
    private String referenceNumber;

    @Size(max = 50, message = "Reference type cannot exceed 50 characters")
    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private Integer createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Movement Type Enum
     */
    public enum MovementType {
        GRN, // Goods received (IN)
        SALE, // Sale to customer (OUT)
        RETURN, // Customer return (IN)
        ADJUSTMENT, // Manual stock adjustment (IN/OUT)
        DAMAGE, // Damaged goods (OUT)
        EXPIRED, // Expired goods removed (OUT)
        TRANSFER // Stock transfer (IN/OUT)
    }
}
