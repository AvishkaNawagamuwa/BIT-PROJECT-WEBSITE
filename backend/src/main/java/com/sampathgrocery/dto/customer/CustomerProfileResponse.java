package com.sampathgrocery.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for customer profile response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileResponse {
    private Integer profileId;
    private Integer customerId;
    private String preferredContactMethod;
    private String preferences;
    private String notes;
}
