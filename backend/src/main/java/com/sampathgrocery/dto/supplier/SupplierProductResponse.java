package com.sampathgrocery.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Supplier-Product Association Response DTO
 * Returns supplier-product relationship data
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierProductResponse {

    private Long id;
    private Integer supplierId;
    private String supplierName;
    private Integer productId;
    private String productCode;
    private String productName;
    private String productCategory;
    private String barcode;
    private String supplierProductCode;
    private BigDecimal purchasePrice;
    private Integer leadTimeDays;
    private Integer minimumOrderQty;
    private Boolean isPrimarySupplier;
    private LocalDate lastSuppliedDate;
    private String status;
}
