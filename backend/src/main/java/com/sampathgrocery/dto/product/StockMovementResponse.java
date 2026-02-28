package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.StockMovement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Stock Movement Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
    private Integer movementId;
    private Integer batchId;
    private String batchCode;
    private Integer productId;
    private String productName;
    private StockMovement.MovementType movementType;
    private Integer quantity;
    private Integer beforeQuantity;
    private Integer afterQuantity;
    private String referenceNumber;
    private String referenceType;
    private String notes;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private String createdByName;
}
