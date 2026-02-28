package com.sampathgrocery.dto.delivery;

import com.sampathgrocery.entity.delivery.FuelType;
import com.sampathgrocery.entity.delivery.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {
    private Integer vehicleId;
    private String vehicleCode;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String make;
    private String model;
    private Integer yearManufactured;
    private BigDecimal capacityKg;
    private FuelType fuelType;
    private LocalDate insuranceExpiryDate;
    private LocalDate revenueLicenseExpiryDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
