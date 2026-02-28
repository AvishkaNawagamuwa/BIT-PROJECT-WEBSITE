package com.sampathgrocery.entity.delivery;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DeliveryRouteItem Entity - Join table for route and deliveries
 */
@Entity
@Table(name = "DeliveryRouteItem")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryRouteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_item_id")
    private Integer routeItemId;

    @NotNull(message = "Route is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private DeliveryRoute route;

    @NotNull(message = "Delivery is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @Column(name = "stop_order")
    private Integer stopOrder;
}
