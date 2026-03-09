package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.UnitOfMeasure;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Unit of Measure Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UnitOfMeasureRequest {

    @NotBlank(message = "Unit name is required")
    @Size(max = 50, message = "Unit name cannot exceed 50 characters")
    private String unitName;

    @NotBlank(message = "Unit code is required")
    @Size(max = 10, message = "Unit code cannot exceed 10 characters")
    private String unitCode;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private UnitOfMeasure.Status status = UnitOfMeasure.Status.ACTIVE;
}
