package com.sampathgrocery.dto.delivery;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating/updating Driver
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverRequest {

    @NotBlank(message = "Driver code is required")
    @Size(max = 30, message = "Driver code cannot exceed 30 characters")
    private String driverCode;

    private Integer userId;

    private Integer employeeId;

    @NotBlank(message = "Full name is required")
    @Size(max = 200, message = "Full name cannot exceed 200 characters")
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Size(max = 20, message = "Phone cannot exceed 20 characters")
    private String phone;

    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @NotBlank(message = "License number is required")
    @Size(max = 50, message = "License number cannot exceed 50 characters")
    private String licenseNumber;

    private LocalDate licenseExpiryDate;

    @Size(max = 50, message = "License type cannot exceed 50 characters")
    private String licenseType;

    private String address;

    private Boolean isActive = true;
}
