package com.sampathgrocery.dto.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Stock Adjustment Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentRequest {

    @NotNull(message = "Batch ID is required")
    private Integer batchId;

    @NotNull(message = "Adjustment quantity is required")
    private Integer quantity; // Can be positive (add) or negative (remove)

    @NotBlank(message = "Reason is required")
    private String reason;

    private String notes;
}
