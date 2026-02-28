package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.ProductBatch;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Product Batch Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatchRequest {

    @NotBlank(message = "Batch code is required")
    private String batchCode;

    @NotNull(message = "Product is required")
    private Integer productId;

    private Integer supplierId;

    @NotNull(message = "Purchase price is required")
    @Min(value = 0)
    private BigDecimal purchasePrice;

    @NotNull(message = "Selling price is required")
    @Min(value = 0)
    private BigDecimal sellingPrice;

    private BigDecimal mrp;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0)
    private Integer stockQuantity;

    @NotNull(message = "Received quantity is required")
    @Min(value = 1)
    private Integer receivedQuantity;

    private LocalDate manufacturedDate;

    private LocalDate expiryDate;

    @NotNull(message = "Received date is required")
    private LocalDate receivedDate;

    private ProductBatch.BatchStatus status;
}
