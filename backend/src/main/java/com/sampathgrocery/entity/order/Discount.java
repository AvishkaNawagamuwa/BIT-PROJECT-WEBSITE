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
 * Discount Entity - Enhanced with comprehensive discount configuration features
 * Supports Loyalty, Seasonal, Daily, Bulk Threshold, and Custom Product
 * discounts
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

    // ========== NEW: Discount Category ==========
    @NotNull(message = "Discount category is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_category", length = 30)
    private DiscountCategory discountCategory;

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

    // ========== NEW: Enhanced Product Scope ==========
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

    // ========== NEW: Customer Type Condition ==========
    @Enumerated(EnumType.STRING)
    @Column(name = "customer_type_condition", length = 20)
    private CustomerTypeCondition customerTypeCondition = CustomerTypeCondition.ANY;

    // ========== NEW: Bulk Threshold ==========
    @Column(name = "bulk_threshold_quantity")
    private Integer bulkThresholdQuantity;

    // ========== NEW: Priority Level ==========
    @Column(name = "priority_level")
    private Integer priorityLevel = 0; // Higher number = higher priority

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

    // ========== ENUMS ==========

    /**
     * Discount Category Enum
     * Defines the type of discount being offered
     */
    public enum DiscountCategory {
        LOYALTY, // Loyalty discount for registered customers
        SEASONAL, // Seasonal promotions (holidays, events)
        DAILY, // Daily special discounts
        BULK_THRESHOLD, // Discount for bulk purchases
        CUSTOM_PRODUCT // Custom discount for specific products
    }

    /**
     * Discount Type Enum
     * Defines how the discount value is applied
     */
    public enum DiscountType {
        PERCENTAGE, // Percentage discount (e.g., 10%)
        FIXED_AMOUNT, // Fixed amount discount (e.g., Rs. 100 off)
        BUY_X_GET_Y // Buy X get Y free
    }

    /**
     * Applicable To Enum
     * Defines the scope of products this discount applies to
     */
    public enum ApplicableTo {
        ALL_PRODUCTS, // Applies to all products
        CATEGORY, // Applies to specific categories
        SPECIFIC_PRODUCTS, // Applies to specific products
        PRODUCT_SET // Applies to a set of selected products
    }

    /**
     * Customer Type Condition Enum
     * Defines which type of customers can use this discount
     */
    public enum CustomerTypeCondition {
        ANY, // Available for all customer types
        LOYALTY_ONLY, // Only for loyalty program members
        NEW_CUSTOMERS, // Only for new customers
        REGULAR_ONLY // Only for regular customers
    }

    // ========== BUSINESS LOGIC METHODS ==========

    /**
     * Check if discount is currently valid based on date, status, and usage limits
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
     * Check if discount is valid for a specific customer
     */
    public boolean isValidForCustomer(Boolean isLoyaltyMember, Integer customerUsageCount) {
        if (!isValid()) {
            return false;
        }

        // Check customer type condition
        switch (customerTypeCondition) {
            case LOYALTY_ONLY:
                if (!isLoyaltyMember) {
                    return false;
                }
                break;
            case REGULAR_ONLY:
                if (isLoyaltyMember) {
                    return false;
                }
                break;
            case NEW_CUSTOMERS:
                // Simple check: assume usage count > 0 means not new
                if (customerUsageCount != null && customerUsageCount > 0) {
                    return false;
                }
                break;
            case ANY:
            default:
                // No restriction
                break;
        }

        // Check usage per customer
        if (usagePerCustomer != null && customerUsageCount != null && customerUsageCount >= usagePerCustomer) {
            return false;
        }

        return true;
    }

    /**
     * Check if discount applies to a specific product
     */
    public boolean appliesTo(Integer productId, Integer categoryId) {
        switch (applicableTo) {
            case ALL_PRODUCTS:
                return true;
            case CATEGORY:
                return isInApplicableIds(categoryId);
            case SPECIFIC_PRODUCTS:
                return isInApplicableIds(productId);
            case PRODUCT_SET:
                return isInApplicableIds(productId);
            default:
                return false;
        }
    }

    /**
     * Check if a specific ID is in the applicable IDs list
     */
    private boolean isInApplicableIds(Integer id) {
        if (applicableIds == null || applicableIds.trim().isEmpty()) {
            return false;
        }

        try {
            // Parse JSON array: [1,2,3]
            String cleaned = applicableIds.replaceAll("[\\[\\]\\s]", "");
            String[] ids = cleaned.split(",");
            for (String idStr : ids) {
                if (Integer.parseInt(idStr.trim()) == id) {
                    return true;
                }
            }
        } catch (NumberFormatException e) {
            // Invalid format, return false
            return false;
        }

        return false;
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
                // Custom logic for buy X get Y - can be extended based on requirements
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
