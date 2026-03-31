package com.sampathgrocery.dto.loyalty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for Loyalty Configuration Response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyConfigResponse {
    private Long id;
    private Boolean isEnabled;
    private BigDecimal earnRate;
    private BigDecimal minPurchaseAmount;
    private Integer maxPointsPerTransaction;
    private BigDecimal pointValue;
    private Integer minRedeemPoints;
    private String tierConfig;
    private Boolean isActive;
}
