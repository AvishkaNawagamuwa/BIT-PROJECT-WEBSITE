package com.sampathgrocery.dto.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Supplier Request DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {

    @NotBlank(message = "Supplier code is required")
    @Size(max = 30)
    private String supplierCode;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 200)
    private String supplierName;

    @Size(max = 200)
    private String contactPerson;

    @NotBlank(message = "Phone is required")
    @Size(max = 20)
    private String phone;

    @Size(max = 20)
    private String alternatePhone;

    @Email
    @Size(max = 100)
    private String email;

    @NotBlank(message = "Address is required")
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 200)
    private String paymentTerms;

    private BigDecimal creditLimit;

    private Boolean isActive = true;

    // Product IDs that this supplier supplies
    private List<Integer> productIds;
}
