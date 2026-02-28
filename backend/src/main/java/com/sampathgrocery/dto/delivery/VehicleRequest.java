package com.sampathgrocery.dto.delivery;

import com.sampathgrocery.entity.delivery.FuelType;
import com.sampathgrocery.entity.delivery.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {

    @NotBlank(message = "Vehicle number is required")
    @Size(max = 20, message = "Vehicle number cannot exceed 20 characters")
    private String vehicleNumber;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    @Size(max = 100, message = "Make cannot exceed 100 characters")
    private String make;

    @Size(max = 100, message = "Model cannot exceed 100 characters")
    private String model;

    private Integer yearManufactured;

    private BigDecimal capacityKg;

    private FuelType fuelType;

    private LocalDate insuranceExpiryDate;

    private LocalDate revenueLicenseExpiryDate;
}
