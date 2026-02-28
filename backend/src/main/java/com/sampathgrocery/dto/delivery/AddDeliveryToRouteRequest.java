package com.sampathgrocery.dto.delivery;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddDeliveryToRouteRequest {

    @NotNull(message = "Delivery ID is required")
    private Integer deliveryId;

    private Integer stopOrder;
}
