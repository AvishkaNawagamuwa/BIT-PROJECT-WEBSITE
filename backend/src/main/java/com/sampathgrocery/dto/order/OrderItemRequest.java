package com.sampathgrocery.dto.order;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for order item in create order request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    @NotNull(message = "Batch ID is required")
    private Integer batchId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    // Unit price will be fetched from ProductBatch.sellingPrice
    // But can be overridden for special pricing
    private java.math.BigDecimal unitPrice;

    private java.math.BigDecimal discountPercentage;
}
