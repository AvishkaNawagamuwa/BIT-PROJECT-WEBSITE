package com.sampathgrocery.entity.customer;

import com.sampathgrocery.entity.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Customer Entity - Manages customer information and loyalty program
 */
@Entity
@Table(name = "Customer")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Integer customerId;

    @NotBlank(message = "Customer code is required")
    @Size(max = 30, message = "Customer code cannot exceed 30 characters")
    @Column(name = "customer_code", nullable = false, unique = true, length = 30)
    private String customerCode;

    /**
     * Link to User account for online shopping (optional for walk-in customers)
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @NotBlank(message = "Full name is required")
    @Size(max = 200, message = "Full name cannot exceed 200 characters")
    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    @Column(name = "phone", nullable = false, unique = true, length = 20)
    private String phone;

    @Pattern(regexp = "^[0-9]{10}$", message = "Alternate phone must be 10 digits")
    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    @Email(message = "Invalid email format")
    @Column(name = "email", unique = true, length = 100)
    private String email;

    @Size(max = 20, message = "NIC cannot exceed 20 characters")
    @Column(name = "nic", unique = true, length = 20)
    private String nic;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    @Column(name = "city", length = 100)
    private String city;

    @Size(max = 50, message = "Loyalty card number cannot exceed 50 characters")
    @Column(name = "loyalty_card_number", unique = true, length = 50)
    private String loyaltyCardNumber;

    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "loyalty_tier", length = 20)
    private LoyaltyTier loyaltyTier = LoyaltyTier.BRONZE;

    @Column(name = "total_purchases", precision = 12, scale = 2)
    private BigDecimal totalPurchases = BigDecimal.ZERO;

    @Column(name = "total_orders")
    private Integer totalOrders = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    /**
     * Loyalty Tier Enum
     * BRONZE: 0-499 points
     * SILVER: 500-1499 points
     * GOLD: 1500-2999 points
     * PLATINUM: 3000+ points
     */
    public enum LoyaltyTier {
        BRONZE, SILVER, GOLD, PLATINUM
    }

    /**
     * Calculate and update loyalty tier based on current points
     */
    public void calculateLoyaltyTier() {
        if (loyaltyPoints >= 3000) {
            this.loyaltyTier = LoyaltyTier.PLATINUM;
        } else if (loyaltyPoints >= 1500) {
            this.loyaltyTier = LoyaltyTier.GOLD;
        } else if (loyaltyPoints >= 500) {
            this.loyaltyTier = LoyaltyTier.SILVER;
        } else {
            this.loyaltyTier = LoyaltyTier.BRONZE;
        }
    }

    /**
     * Add loyalty points and recalculate tier
     */
    public void addLoyaltyPoints(Integer points) {
        if (points != null && points > 0) {
            this.loyaltyPoints = (this.loyaltyPoints == null ? 0 : this.loyaltyPoints) + points;
            calculateLoyaltyTier();
        }
    }

    /**
     * Redeem (subtract) loyalty points
     */
    public boolean redeemLoyaltyPoints(Integer points) {
        if (points != null && points > 0 && this.loyaltyPoints >= points) {
            this.loyaltyPoints -= points;
            calculateLoyaltyTier();
            return true;
        }
        return false;
    }
}
