package com.sampathgrocery.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for discount response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountResponse {
    private Integer discountId;
    private String discountCode;
    private String discountName;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minPurchaseAmount;
    private BigDecimal maxDiscountAmount;
    private String applicableTo;
    private String applicableIds;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer usageLimit;
    private Integer usagePerCustomer;
    private Integer timesUsed;
    private Boolean isActive;
}
