package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.Brand;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Brand Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandResponse {

    private Integer brandId;
    private String brandName;
    private String description;
    private Brand.Status status;
    private Integer productCount; // Number of products using this brand
    private LocalDateTime createdAt;
}
