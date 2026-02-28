package com.sampathgrocery.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * GRN Dashboard Statistics DTO
 * Provides summary data for the GRN dashboard cards
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRNDashboardStats {
    private Long totalGRNs; // Total count of all GRNs
    private Long thisMonthGRNs; // GRNs received this month
    private Long grnWithIssues; // GRNs with quality issues
    private BigDecimal totalValue; // Total value of approved GRNs
    private Long waitingPOs; // Count of POs waiting to be received
    private Long partialPOs; // Count of POs partially received
}
