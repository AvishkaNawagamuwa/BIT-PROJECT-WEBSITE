package com.sampathgrocery.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Purchase Order Item Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItemResponse {
    private Integer reorderItemId;
    private Integer productId;
    private String productName;
    private String productCode;
    private Integer quantity; // Total ordered quantity
    private Integer receivedQuantity; // Cumulative received quantity
    private Integer remainingQuantity; // quantity - receivedQuantity
    private BigDecimal expectedUnitPrice;
    private BigDecimal lineTotal;
    private String notes;
    
    // Helper method to calculate remaining quantity
    public Integer getRemainingQuantity() {
        if (quantity == null) return 0;
        if (receivedQuantity == null) return quantity;
        return quantity - receivedQuantity;
    }
    
    // Helper method to get receiving status
    public String getReceivingStatus() {
        if (receivedQuantity == null || receivedQuantity == 0) {
            return "WAITING";
        } else if (receivedQuantity < quantity) {
            return "PARTIAL";
        } else {
            return "RECEIVED";
        }
    }
}
