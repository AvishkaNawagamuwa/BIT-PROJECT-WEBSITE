package com.sampathgrocery.dto.supplier;

import com.sampathgrocery.entity.supplier.PurchaseOrder;
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
 * Purchase Order Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderRequest {

    @NotNull(message = "Supplier is required")
    private Integer supplierId;

    @NotNull(message = "Requested date is required")
    private LocalDate requestedDate;

    private LocalDate expectedDeliveryDate;

    private String notes;

    @Valid
    private List<PurchaseOrderItemRequest> items = new ArrayList<>();

    private BigDecimal taxAmount = BigDecimal.ZERO;
    private BigDecimal discountAmount = BigDecimal.ZERO;
}
