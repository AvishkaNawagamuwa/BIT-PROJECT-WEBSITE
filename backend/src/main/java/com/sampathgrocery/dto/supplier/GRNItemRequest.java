package com.sampathgrocery.dto.supplier;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * GRN Item Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRNItemRequest {

    @NotNull(message = "Product is required")
    private Integer productId;

    private String batchCode; // Optional - will auto-generate if not provided

    private Integer orderedQuantity;

    @NotNull(message = "Received quantity is required")
    @Min(value = 1, message = "Received quantity must be at least 1")
    private Integer receivedQuantity;

    @NotNull(message = "Purchase price is required")
    @Min(value = 0)
    private BigDecimal finalPurchasePrice;

    private BigDecimal sellingPrice; // Optional - can calculate with margin

    private LocalDate manufacturedDate;

    private LocalDate expiryDate;

    private String notes;
}
