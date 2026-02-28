package com.sampathgrocery.dto.customer;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for redeeming loyalty points
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyRedemptionRequest {

    @NotNull(message = "Points to redeem is required")
    @Min(value = 1, message = "Points must be at least 1")
    private Integer pointsToRedeem;
}
