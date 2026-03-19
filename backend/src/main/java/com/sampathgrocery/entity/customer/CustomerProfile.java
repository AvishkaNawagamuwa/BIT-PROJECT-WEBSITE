package com.sampathgrocery.entity.customer;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Customer Profile Entity - Extended customer information and preferences
 * One-to-one relationship with Customer
 */
@Entity
@Table(name = "CustomerProfile")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Integer profileId;

    @NotNull(message = "Customer is required")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_contact_method", length = 20)
    private PreferredContactMethod preferredContactMethod = PreferredContactMethod.PHONE;

    /**
     * JSON field for storing customer preferences
     * Example: {"favorite_categories": [1,2,3], "dietary_restrictions":
     * ["Vegetarian"]}
     */
    @Column(name = "preferences", columnDefinition = "JSON")
    private String preferences;

    /**
     * Internal notes about the customer (only visible to staff)
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Preferred Contact Method Enum
     */
    public enum PreferredContactMethod {
        PHONE, EMAIL, SMS, WHATSAPP
    }
}
