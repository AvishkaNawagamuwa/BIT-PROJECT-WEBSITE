package com.sampathgrocery.dto.delivery;

import com.sampathgrocery.entity.delivery.RouteStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRouteResponse {
    private Integer routeId;
    private String routeName;
    private Integer driverId;
    private String driverName;
    private Integer vehicleId;
    private String vehicleNumber;
    private LocalDate routeDate;
    private Integer totalDeliveries;
    private Integer completedDeliveries;
    private Integer failedDeliveries;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private RouteStatus status;
    private BigDecimal totalDistanceKm;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
