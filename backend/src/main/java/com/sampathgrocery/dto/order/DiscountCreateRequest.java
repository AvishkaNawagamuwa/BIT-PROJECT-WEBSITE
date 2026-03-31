package com.sampathgrocery.dto.order;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for creating a new discount
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountCreateRequest {

    @NotBlank(message = "Discount code is required")
    @Size(max = 50, message = "Discount code cannot exceed 50 characters")
    private String discountCode;

    @NotBlank(message = "Discount name is required")
    @Size(max = 200, message = "Discount name cannot exceed 200 characters")
    private String discountName;

    @NotNull(message = "Discount category is required")
    private String discountCategory; // LOYALTY, SEASONAL, DAILY, BULK_THRESHOLD, CUSTOM_PRODUCT

    @NotNull(message = "Discount type is required")
    private String discountType; // PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    @DecimalMin(value = "0", message = "Minimum purchase amount cannot be negative")
    private BigDecimal minPurchaseAmount;

    @DecimalMin(value = "0", message = "Maximum discount amount cannot be negative")
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Applicable scope is required")
    private String applicableTo; // ALL_PRODUCTS, CATEGORY, SPECIFIC_PRODUCTS, PRODUCT_SET

    // JSON array of category or product IDs: [1,2,3]
    private String applicableIds;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date cannot be in the past")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Customer type condition is required")
    private String customerTypeCondition; // ANY, LOYALTY_ONLY, NEW_CUSTOMERS, REGULAR_ONLY

    @Min(value = 0, message = "Bulk threshold quantity cannot be negative")
    private Integer bulkThresholdQuantity;

    @Min(value = 0, message = "Priority level cannot be negative")
    private Integer priorityLevel = 0;

    @Min(value = 0, message = "Usage limit cannot be negative")
    private Integer usageLimit;

    @Min(value = 1, message = "Usage per customer must be at least 1")
    private Integer usagePerCustomer = 1;

    @NotNull(message = "Active status is required")
    private Boolean isActive = true;

    /**
     * Validate that end date is on or after start date
     */
    @AssertTrue(message = "End date must be on or after start date")
    public boolean isEndDateAfterStartDate() {
        if (startDate == null || endDate == null) {
            return true; // Let @NotNull handle this
        }
        return !endDate.isBefore(startDate);
    }
}
