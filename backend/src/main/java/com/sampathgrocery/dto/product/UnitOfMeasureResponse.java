package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.UnitOfMeasure;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Unit of Measure Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnitOfMeasureResponse {

    private Integer unitId;
    private String unitName;
    private String unitCode;
    private String description;
    private UnitOfMeasure.Status status;
    private Integer productCount; // Number of products using this unit
    private LocalDateTime createdAt;
}
