package com.sampathgrocery.dto.delivery;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignDeliveryRequest {

    @NotNull(message = "Driver ID is required")
    private Integer driverId;

    @NotNull(message = "Vehicle ID is required")
    private Integer vehicleId;

    private LocalDate scheduledDate;

    private LocalTime scheduledTime;
}
