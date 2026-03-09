package com.sampathgrocery.dto.supplier;

import com.sampathgrocery.entity.supplier.PurchaseOrder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Purchase Order Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderResponse {
    private Integer requestId;
    private String poNumber;
    private Integer supplierId;
    private String supplierName;
    private String supplierContact;
    private PurchaseOrder.POStatus status;
    private LocalDate requestedDate;
    private LocalDate expectedDeliveryDate;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal grandTotal;
    private String notes;
    private String rejectionReason;
    private Integer requestedBy;
    private String requestedByName;
    private Integer approvedBy;
    private String approvedByName;
    private LocalDateTime approvedDate;
    private LocalDateTime createdAt;
    private List<PurchaseOrderItemResponse> items;
    private Integer totalItems;
    private Integer totalQuantity;

    // Receiving tracking fields
    private Integer totalOrdered;
    private Integer totalReceived;
    private Integer totalRemaining;
    private String receivingStatus; // WAITING, PARTIAL, RECEIVED

    // Helper method to get receiving status
    public String getReceivingStatus() {
        if (totalReceived == null || totalReceived == 0) {
            return "WAITING";
        } else if (totalReceived < totalOrdered) {
            return "PARTIAL";
        } else {
            return "RECEIVED";
        }
    }
}
