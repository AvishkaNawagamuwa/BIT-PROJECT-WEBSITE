package com.sampathgrocery.dto.delivery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRequest {

    @NotNull(message = "Order ID is required")
    private Integer orderId;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String deliveryCity;

    @NotBlank(message = "Customer phone is required")
    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String customerPhone;

    private LocalDate scheduledDate;

    private LocalTime scheduledTime;

    private String deliveryNotes;
}
