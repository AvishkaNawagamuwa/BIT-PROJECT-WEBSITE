package com.sampathgrocery.dto.supplier;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * GRN Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GRNRequest {

    private Integer purchaseOrderId; // Optional - can receive without PO

    @NotNull(message = "Supplier is required")
    private Integer supplierId;

    @NotNull(message = "Received date is required")
    private LocalDate receivedDate;

    private String invoiceNumber;

    private LocalDate invoiceDate;

    private String notes;

    @Valid
    @NotNull(message = "Items are required")
    private List<GRNItemRequest> items = new ArrayList<>();

    private BigDecimal taxAmount = BigDecimal.ZERO;
    private BigDecimal discountAmount = BigDecimal.ZERO;
}
