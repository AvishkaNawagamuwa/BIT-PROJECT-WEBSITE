package com.sampathgrocery.entity.loyalty;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Loyalty Configuration Entity
 * Stores system-wide loyalty program settings
 */
@Entity
@Table(name = "loyalty_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "is_enabled")
    private Boolean isEnabled = true;

    @Column(name = "earn_rate", precision = 5, scale = 3)
    private BigDecimal earnRate = new BigDecimal("0.010"); // 0.01% per transaction

    @Column(name = "min_purchase_amount", precision = 10, scale = 2)
    private BigDecimal minPurchaseAmount = BigDecimal.ZERO;

    @Column(name = "max_points_per_transaction")
    private Integer maxPointsPerTransaction = 0; // 0 = unlimited

    @Column(name = "point_value", precision = 5, scale = 2)
    private BigDecimal pointValue = new BigDecimal("1.00"); // 1 point = Rs. 1

    @Column(name = "min_redeem_points")
    private Integer minRedeemPoints = 100;

    @Column(name = "tier_config", columnDefinition = "JSON")
    private String tierConfig; // JSON: {"BRONZE": 500, "SILVER": 1500, "GOLD": 3000}

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by")
    private Long createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private Long updatedBy;

    /**
     * Calculate loyalty points for a transaction
     * Formula: points = (amount * earn_rate) / 100
     */
    public Integer calculatePoints(BigDecimal transactionAmount) {
        if (!isEnabled || transactionAmount == null || transactionAmount.compareTo(minPurchaseAmount) < 0) {
            return 0;
        }

        // points = (amount * earnRate) / 100
        BigDecimal points = transactionAmount
                .multiply(earnRate)
                .divide(new BigDecimal("100"), 0, java.math.RoundingMode.DOWN);

        int pointsInt = points.intValue();

        // Apply maximum points limit if configured
        if (maxPointsPerTransaction != null && maxPointsPerTransaction > 0) {
            pointsInt = Math.min(pointsInt, maxPointsPerTransaction);
        }

        return pointsInt;
    }

    /**
     * Calculate redemption value for points
     */
    public BigDecimal calculateRedemptionValue(Integer points) {
        if (points == null || points <= 0 || pointValue == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(points).multiply(pointValue);
    }
}
