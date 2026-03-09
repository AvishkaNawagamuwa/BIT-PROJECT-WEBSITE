package com.sampathgrocery.entity.product;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * මන පමණ - Unit of Measure Master Data
 * Stores unit of measure information (KG, L, PCS, etc.)
 */
@Entity
@Table(name = "unit_of_measure")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnitOfMeasure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_id")
    private Integer unitId;

    @NotBlank(message = "Unit name is required")
    @Size(max = 50, message = "Unit name cannot exceed 50 characters")
    @Column(name = "unit_name", nullable = false, unique = true, length = 50)
    private String unitName;

    @NotBlank(message = "Unit code is required")
    @Size(max = 10, message = "Unit code cannot exceed 10 characters")
    @Column(name = "unit_code", nullable = false, unique = true, length = 10)
    private String unitCode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private Status status = Status.ACTIVE;

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
            status = Status.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Status Enum
     */
    public enum Status {
        ACTIVE,
        INACTIVE
    }
}
