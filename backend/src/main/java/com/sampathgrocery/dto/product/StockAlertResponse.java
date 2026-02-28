package com.sampathgrocery.dto.product;

import com.sampathgrocery.entity.product.StockAlert;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Stock Alert Response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockAlertResponse {
    private Integer alertId;
    private Integer batchId;
    private String batchCode;
    private Integer productId;
    private String productName;
    private String productCode;
    private StockAlert.AlertType alertType;
    private String alertMessage;
    private StockAlert.Severity severity;
    private Boolean isResolved;
    private LocalDateTime resolvedAt;
    private Integer resolvedBy;
    private String resolvedByName;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private Integer currentStock;
}
