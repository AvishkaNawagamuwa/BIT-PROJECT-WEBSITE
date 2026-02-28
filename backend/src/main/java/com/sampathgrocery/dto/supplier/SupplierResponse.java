package com.sampathgrocery.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Supplier Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    private Integer supplierId;
    private String supplierCode;
    private String supplierName;
    private String contactPerson;
    private String phone;
    private String alternatePhone;
    private String email;
    private String address;
    private String city;
    private String paymentTerms;
    private BigDecimal creditLimit;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Integer totalPurchaseOrders;
    private BigDecimal totalPurchaseValue;
}
