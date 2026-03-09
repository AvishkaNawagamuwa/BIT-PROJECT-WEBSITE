package com.sampathgrocery.entity.supplier;

import com.sampathgrocery.entity.product.Product;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * සප්ලායර්-නිෂ්පාදන සම්බන්ධතාව - Supplier-Product Relationship
 * Junction table for many-to-many relationship between suppliers and products
 * Allows one supplier to supply many products, and one product to come from
 * many suppliers
 */
@Entity
@Table(name = "supplier_product")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // Supplier-specific product details
    @Column(name = "supplier_product_code", length = 50)
    private String supplierProductCode;

    @Column(name = "purchase_price", precision = 10, scale = 2)
    private BigDecimal purchasePrice;

    @Min(value = 1, message = "Lead time must be at least 1 day")
    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Min(value = 1, message = "Minimum order quantity must be at least 1")
    @Column(name = "minimum_order_qty")
    private Integer minimumOrderQty = 1;

    @Column(name = "is_primary_supplier")
    private Boolean isPrimarySupplier = false;

    @Column(name = "last_supplied_date")
    private LocalDate lastSuppliedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private SupplierProductStatus status = SupplierProductStatus.ACTIVE;

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
            status = SupplierProductStatus.ACTIVE;
        }
        if (isPrimarySupplier == null) {
            isPrimarySupplier = false;
        }
        if (minimumOrderQty == null) {
            minimumOrderQty = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Status enum
    public enum SupplierProductStatus {
        ACTIVE,
        INACTIVE,
        DISCONTINUED
    }
}
