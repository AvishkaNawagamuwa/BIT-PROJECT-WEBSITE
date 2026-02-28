package com.sampathgrocery.dto.delivery;

import com.sampathgrocery.entity.delivery.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponse {
    private Integer deliveryId;
    private String deliveryCode;
    private Integer orderId;
    private String orderCode;
    private Integer driverId;
    private String driverName;
    private Integer vehicleId;
    private String vehicleNumber;
    private String deliveryAddress;
    private String deliveryCity;
    private String customerPhone;
    private LocalDate scheduledDate;
    private LocalTime scheduledTime;
    private LocalDateTime actualPickupTime;
    private LocalDateTime actualDeliveryTime;
    private DeliveryStatus status;
    private String deliveryNotes;
    private String proofOfDeliveryUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
