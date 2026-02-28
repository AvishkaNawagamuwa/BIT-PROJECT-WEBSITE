package com.sampathgrocery.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for invoice response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Integer invoiceId;
    private String invoiceNumber;
    private Integer orderId;
    private String orderCode;
    private Integer customerId;
    private String customerName;
    private LocalDateTime invoiceDate;
    private LocalDate dueDate;
    private BigDecimal amount;
    private BigDecimal paidAmount;
    private BigDecimal balance;
    private String status;
    private String notes;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    private String createdBy;
}
