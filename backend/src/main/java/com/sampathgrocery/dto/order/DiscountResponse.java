package com.sampathgrocery.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for discount response - includes all discount configuration details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountResponse {
    private Integer discountId;
    private String discountCode;
    private String discountName;
    private String discountCategory; // NEW: LOYALTY, SEASONAL, DAILY, BULK_THRESHOLD, CUSTOM_PRODUCT
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minPurchaseAmount;
    private BigDecimal maxDiscountAmount;
    private String applicableTo;
    private String applicableIds;
    private LocalDate startDate;
    private LocalDate endDate;
    private String customerTypeCondition; // NEW: ANY, LOYALTY_ONLY, NEW_CUSTOMERS, REGULAR_ONLY
    private Integer bulkThresholdQuantity; // NEW: For bulk discount threshold
    private Integer priorityLevel; // NEW: Priority for multiple discounts
    private Integer usageLimit;
    private Integer usagePerCustomer;
    private Integer timesUsed;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
