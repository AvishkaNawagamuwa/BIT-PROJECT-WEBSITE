package com.sampathgrocery.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRouteItemResponse {
    private Integer routeItemId;
    private Integer routeId;
    private Integer deliveryId;
    private String deliveryCode;
    private String deliveryAddress;
    private String customerPhone;
    private String status;
    private Integer stopOrder;
}
