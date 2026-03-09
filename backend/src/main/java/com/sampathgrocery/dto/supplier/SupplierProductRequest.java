package com.sampathgrocery.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Supplier-Product Association Request DTO
 * Used for adding/updating products supplied by a supplier
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierProductRequest {

    private Integer productId;
    private String supplierProductCode;
    private BigDecimal purchasePrice;
    private Integer leadTimeDays;
    private Integer minimumOrderQty;
    private Boolean isPrimarySupplier;
    private String status; // ACTIVE, INACTIVE, DISCONTINUED
}
