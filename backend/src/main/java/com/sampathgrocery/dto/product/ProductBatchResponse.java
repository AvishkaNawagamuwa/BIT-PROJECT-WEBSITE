package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.ProductBatch;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Product Batch Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductBatchResponse {
    private Integer batchId;
    private String batchCode;
    private String barcode;
    private Integer productId;
    private String productName;
    private String productCode;
    private Integer supplierId;
    private String supplierName;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private BigDecimal mrp;
    private Integer stockQuantity;
    private Integer receivedQuantity;
    private LocalDate manufacturedDate;
    private LocalDate expiryDate;
    private Integer daysUntilExpiry;
    private LocalDate receivedDate;
    private String grnNumber;
    private ProductBatch.BatchStatus status;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
