package com.sampathgrocery.dto.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating customer information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerUpdateRequest {

    @Size(max = 200, message = "Full name cannot exceed 200 characters")
    private String fullName;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    @Pattern(regexp = "^[0-9]{10}$", message = "Alternate phone must be 10 digits")
    private String alternatePhone;

    @Email(message = "Invalid email format")
    private String email;

    private String address;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    private Boolean isActive;
}
