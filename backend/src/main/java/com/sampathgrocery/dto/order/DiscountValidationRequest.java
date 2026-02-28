package com.sampathgrocery.dto.order;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for validating discount code
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiscountValidationRequest {

    @NotBlank(message = "Discount code is required")
    private String discountCode;

    private BigDecimal purchaseAmount;
    private Integer customerId;
}
