package com.sampathgrocery.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating customer profile
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileUpdateRequest {
    private String preferredContactMethod; // PHONE, EMAIL, SMS, WHATSAPP
    private String preferences; // JSON string
    private String notes;
}
