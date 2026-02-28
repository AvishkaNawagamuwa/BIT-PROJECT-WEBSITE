package com.sampathgrocery.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for loyalty redemption response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyRedemptionResponse {
    private Integer pointsRedeemed;
    private BigDecimal discountAmount;
    private Integer remainingPoints;
    private String message;
}
