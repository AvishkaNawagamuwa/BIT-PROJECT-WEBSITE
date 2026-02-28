package com.sampathgrocery.dto.delivery;

import com.sampathgrocery.entity.delivery.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryStatusHistoryResponse {
    private Integer historyId;
    private Integer deliveryId;
    private DeliveryStatus status;
    private String notes;
    private BigDecimal locationLatitude;
    private BigDecimal locationLongitude;
    private LocalDateTime createdAt;
    private Integer createdBy;
}
