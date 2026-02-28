package com.sampathgrocery.entity.product;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * නිෂ්පාදන - Master Product Catalog
 * Contains all product information and reorder settings
 */
@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @NotBlank(message = "Product code is required")
    @Size(max = 30, message = "Product code cannot exceed 30 characters")
    @Column(name = "product_code", nullable = false, unique = true, length = 30)
    private String productCode;

    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Product name cannot exceed 200 characters")
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @NotNull(message = "Category is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Size(max = 100, message = "Brand cannot exceed 100 characters")
    @Column(name = "brand", length = 100)
    private String brand;

    @Size(max = 100, message = "Barcode cannot exceed 100 characters")
    @Column(name = "barcode", unique = true, length = 100)
    private String barcode;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_of_measure", length = 10)
    private UnitOfMeasure unitOfMeasure = UnitOfMeasure.PCS;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Min(value = 0, message = "Reorder point cannot be negative")
    @Column(name = "reorder_point")
    private Integer reorderPoint = 10;

    @Min(value = 0, message = "Reorder quantity cannot be negative")
    @Column(name = "reorder_quantity")
    private Integer reorderQuantity = 50;

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
        if (unitOfMeasure == null) {
            unitOfMeasure = UnitOfMeasure.PCS;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Unit of Measure Enum
     */
    public enum UnitOfMeasure {
        KG, // Kilograms
        G, // Grams
        L, // Liters
        ML, // Milliliters
        PCS, // Pieces
        PACK, // Pack
        BOX // Box
    }
}
