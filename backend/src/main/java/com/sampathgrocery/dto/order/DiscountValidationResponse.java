package com.sampathgrocery.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for discount validation response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountValidationResponse {
    private Boolean isValid;
    private String message;
    private BigDecimal discountAmount;
    private Integer discountId;
    private String discountCode;
    private String discountName;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minimumOrderAmount;
}
