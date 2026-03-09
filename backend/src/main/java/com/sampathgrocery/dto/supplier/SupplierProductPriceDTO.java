package com.sampathgrocery.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Supplier-Product Price Information DTO
 * Returns pricing information for a specific supplier-product combination
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierProductPriceDTO {

    private Integer supplierId;
    private String supplierName;
    private Integer productId;
    private String productName;
    private String productCode;

    // Default purchase price from supplier_products table
    private BigDecimal defaultPurchasePrice;

    // Last purchase price from purchase order history
    private BigDecimal lastPurchasePrice;
    private LocalDate lastPurchaseDate;

    // Suggested price (prioritizes last purchase price over default)
    private BigDecimal suggestedUnitPrice;

    // Additional supplier-product details
    private Integer leadTimeDays;
    private Integer minimumOrderQty;
    private Boolean isPrimarySupplier;
}
