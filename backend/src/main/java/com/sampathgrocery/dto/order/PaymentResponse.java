package com.sampathgrocery.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for payment response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Integer paymentId;
    private Integer orderId;
    private String orderCode;
    private Integer methodId;
    private String methodName;
    private BigDecimal amount;
    private String status;
    private String transactionId;
    private String referenceNumber;
    private String notes;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
