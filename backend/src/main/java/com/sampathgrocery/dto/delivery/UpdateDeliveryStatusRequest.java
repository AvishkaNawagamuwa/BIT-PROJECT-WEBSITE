package com.sampathgrocery.dto.delivery;

import com.sampathgrocery.entity.delivery.DeliveryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDeliveryStatusRequest {

    @NotNull(message = "Status is required")
    private DeliveryStatus status;

    private String notes;

    private BigDecimal latitude;

    private BigDecimal longitude;
}
