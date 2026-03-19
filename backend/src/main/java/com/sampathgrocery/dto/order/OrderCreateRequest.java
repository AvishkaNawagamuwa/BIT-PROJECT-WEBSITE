package com.sampathgrocery.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating a new order (POS or Online)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {

    private Integer customerId; // Optional for walk-in customers

    @NotNull(message = "Order type is required")
    private String orderType; // WALK_IN, ONLINE, PHONE

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<OrderItemRequest> items;

    private BigDecimal taxAmount;
    private BigDecimal deliveryCharge;
    private Integer loyaltyPointsUsed;

    // Fulfillment Type fields
    @NotNull(message = "Fulfillment type is required")
    private String fulfillmentType; // PICKUP or DELIVERY

    // Delivery address fields (required only if fulfillmentType is DELIVERY)
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryPhone;
}
