package com.sampathgrocery.entity.order;

import com.sampathgrocery.entity.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Discount Entity - Manages promotional discounts and coupon codes
 */
@Entity
@Table(name = "Discount")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Discount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "discount_id")
    private Integer discountId;

    @NotBlank(message = "Discount code is required")
    @Size(max = 50, message = "Discount code cannot exceed 50 characters")
    @Column(name = "discount_code", nullable = false, unique = true, length = 50)
    private String discountCode;

    @NotBlank(message = "Discount name is required")
    @Size(max = 200, message = "Discount name cannot exceed 200 characters")
    @Column(name = "discount_name", nullable = false, length = 200)
    private String discountName;

    @NotNull(message = "Discount type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_purchase_amount", precision = 10, scale = 2)
    private BigDecimal minPurchaseAmount = BigDecimal.ZERO;

    @Column(name = "max_discount_amount", precision = 10, scale = 2)
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Applicable scope is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "applicable_to", length = 30)
    private ApplicableTo applicableTo = ApplicableTo.ALL_PRODUCTS;

    /**
     * JSON array of category or product IDs
     * Example: [1,2,3] for category IDs or product IDs
     */
    @Column(name = "applicable_ids", columnDefinition = "JSON")
    private String applicableIds;

    @NotNull(message = "Start date is required")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "usage_per_customer")
    private Integer usagePerCustomer = 1;

    @Column(name = "times_used")
    private Integer timesUsed = 0;

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
     * Discount Type Enum
     */
    public enum DiscountType {
        PERCENTAGE, // Percentage discount (e.g., 10%)
        FIXED_AMOUNT, // Fixed amount discount (e.g., Rs. 100 off)
        BUY_X_GET_Y // Buy X get Y free
    }

    /**
     * Applicable To Enum
     */
    public enum ApplicableTo {
        ALL_PRODUCTS, // Applies to all products
        CATEGORY, // Applies to specific categories
        SPECIFIC_PRODUCTS // Applies to specific products
    }

    /**
     * Check if discount is currently valid
     */
    public boolean isValid() {
        if (!isActive) {
            return false;
        }

        LocalDate today = LocalDate.now();
        if (today.isBefore(startDate) || today.isAfter(endDate)) {
            return false;
        }

        // Check usage limit
        if (usageLimit != null && timesUsed >= usageLimit) {
            return false;
        }

        return true;
    }

    /**
     * Calculate discount amount for a given purchase amount
     */
    public BigDecimal calculateDiscountAmount(BigDecimal purchaseAmount) {
        if (!isValid()) {
            return BigDecimal.ZERO;
        }

        // Check minimum purchase requirement
        if (minPurchaseAmount != null && purchaseAmount.compareTo(minPurchaseAmount) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discountAmount = BigDecimal.ZERO;

        switch (discountType) {
            case PERCENTAGE:
                discountAmount = purchaseAmount.multiply(discountValue).divide(BigDecimal.valueOf(100), 2,
                        BigDecimal.ROUND_HALF_UP);
                break;
            case FIXED_AMOUNT:
                discountAmount = discountValue;
                break;
            case BUY_X_GET_Y:
                // Custom logic for buy X get Y - not fully implemented here
                discountAmount = BigDecimal.ZERO;
                break;
        }

        // Apply maximum discount limit
        if (maxDiscountAmount != null && discountAmount.compareTo(maxDiscountAmount) > 0) {
            discountAmount = maxDiscountAmount;
        }

        // Ensure discount does not exceed purchase amount
        if (discountAmount.compareTo(purchaseAmount) > 0) {
            discountAmount = purchaseAmount;
        }

        return discountAmount;
    }

    /**
     * Increment usage counter
     */
    public void incrementUsage() {
        this.timesUsed = (this.timesUsed == null ? 0 : this.timesUsed) + 1;
    }
}
