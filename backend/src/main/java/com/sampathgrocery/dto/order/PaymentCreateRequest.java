package com.sampathgrocery.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for payment request
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateRequest {
    private Integer orderId;
    private Integer methodId;
    private BigDecimal amount;
    private String transactionId;
    private String referenceNumber;
    private String notes;
}
