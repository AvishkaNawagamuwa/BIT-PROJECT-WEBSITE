package com.sampathgrocery.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for updating customer profile
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileUpdateRequest {
    private LocalDate dateOfBirth;
    private String gender; // MALE, FEMALE, OTHER
    private String preferredContactMethod; // PHONE, EMAIL, SMS, WHATSAPP
    private String preferences; // JSON string
    private String notes;
}
