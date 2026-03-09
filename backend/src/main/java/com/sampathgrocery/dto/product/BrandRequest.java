package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.Brand;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Brand Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BrandRequest {

    @NotBlank(message = "Brand name is required")
    @Size(max = 100, message = "Brand name cannot exceed 100 characters")
    private String brandName;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    private Brand.Status status = Brand.Status.ACTIVE;
}
