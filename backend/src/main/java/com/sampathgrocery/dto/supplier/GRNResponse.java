package com.sampathgrocery.dto.supplier;

import com.sampathgrocery.entity.supplier.GRN;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * GRN Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRNResponse {
    private Integer grnId;
    private String grnNumber;
    private Integer purchaseOrderId;
    private String poNumber;
    private Integer supplierId;
    private String supplierName;
    private LocalDate receivedDate;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal grandTotal;
    private GRN.QualityStatus qualityStatus;
    private GRN.GRNStatus status;
    private String notes;
    private Integer receivedBy;
    private String receivedByName;
    private Integer verifiedBy;
    private String verifiedByName;
    private LocalDateTime createdAt;
    private List<GRNItemResponse> items;
    private Integer totalItems;
    private Integer totalQuantity;
}
