package com.sampathgrocery.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * GRN Item Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRNItemResponse {
    private Integer grnItemId;
    private Integer productId;
    private String productName;
    private String productCode;
    private String batchCode;
    private Integer orderedQuantity;
    private Integer receivedQuantity;
    private Integer variance; // receivedQty - orderedQty
    private BigDecimal finalPurchasePrice;
    private BigDecimal sellingPrice;
    private BigDecimal lineTotal;
    private LocalDate manufacturedDate;
    private LocalDate expiryDate;
    private String notes;
}
