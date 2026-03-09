package com.sampathgrocery.entity.supplier;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * සපයන්නන් - Supplier Master Records
 * Contains all supplier information and payment terms
 */
@Entity
@Table(name = "supplier")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "supplier_id")
    private Integer supplierId;

    @NotBlank(message = "Supplier code is required")
    @Size(max = 30, message = "Supplier code cannot exceed 30 characters")
    @Column(name = "supplier_code", nullable = false, unique = true, length = 30)
    private String supplierCode;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 200, message = "Supplier name cannot exceed 200 characters")
    @Column(name = "supplier_name", nullable = false, length = 200)
    private String supplierName;

    @Size(max = 200, message = "Contact person cannot exceed 200 characters")
    @Column(name = "contact_person", length = 200)
    private String contactPerson;

    @NotBlank(message = "Phone is required")
    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Size(max = 20, message = "Alternate phone cannot exceed 20 characters")
    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    @Column(name = "email", length = 100)
    private String email;

    @NotBlank(message = "Address is required")
    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    @Column(name = "city", length = 100)
    private String city;

    @Size(max = 200, message = "Payment terms cannot exceed 200 characters")
    @Column(name = "payment_terms", length = 200)
    private String paymentTerms;

    @Column(name = "credit_limit", precision = 12, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // Many-to-Many relationship with Products through SupplierProduct
    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<SupplierProduct> supplierProducts = new ArrayList<>();

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
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
