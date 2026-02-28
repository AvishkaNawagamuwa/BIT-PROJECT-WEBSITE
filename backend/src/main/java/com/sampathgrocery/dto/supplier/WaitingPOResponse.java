package com.sampathgrocery.dto.supplier;

import com.sampathgrocery.entity.supplier.PurchaseOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Waiting PO Response DTO
 * Shows POs that are ready to receive (APPROVED or PARTIALLY_RECEIVED)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WaitingPOResponse {
    private Integer requestId;
    private String poNumber;
    private Integer supplierId;
    private String supplierName;
    private LocalDate expectedDeliveryDate;
    private LocalDate requestedDate;
    private PurchaseOrder.POStatus status;
    private BigDecimal grandTotal;
    private Integer totalItems;
    private Integer totalOrdered;
    private Integer totalReceived;
    private Integer totalRemaining;
    private String receivingStatus; // WAITING or PARTIAL
    
    // Helper method to determine receiving status
    public String getReceivingStatus() {
        if (totalReceived == null || totalReceived == 0) {
            return "WAITING";
        } else if (totalReceived < totalOrdered) {
            return "PARTIAL";
        } else {
            return "RECEIVED";
        }
    }
    
    // Helper method to calculate completion percentage
    public Integer getCompletionPercentage() {
        if (totalOrdered == null || totalOrdered == 0) {
            return 0;
        }
        if (totalReceived == null) {
            return 0;
        }
        return (totalReceived * 100) / totalOrdered;
    }
}
