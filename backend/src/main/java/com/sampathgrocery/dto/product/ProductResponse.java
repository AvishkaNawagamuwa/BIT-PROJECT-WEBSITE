package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Product Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Integer productId;
    private String productCode;
    private String productName;
    private Integer categoryId;
    private String categoryName;
    private Integer brandId;
    private String brandName;
    private String barcode;
    private Integer unitId;
    private String unitCode;
    private String unitName;
    private String description;
    private String imageUrl;
    private Integer reorderPoint;
    private Integer reorderQuantity;
    private Integer totalStock; // Total across all batches
    private BigDecimal sellingPrice; // Latest batch selling price for POS
    private Boolean needsReorder; // totalStock < reorderPoint
    private Boolean isActive;
    private LocalDateTime createdAt;
}
