package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String brand;
    private String barcode;
    private Product.UnitOfMeasure unitOfMeasure;
    private String description;
    private String imageUrl;
    private Integer reorderPoint;
    private Integer reorderQuantity;
    private Integer totalStock; // Total across all batches
    private Boolean needsReorder; // totalStock < reorderPoint
    private Boolean isActive;
    private LocalDateTime createdAt;
}
