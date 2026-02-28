package com.sampathgrocery.dto.delivery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for Driver Response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {

    private Integer driverId;
    private String driverCode;
    private Integer userId;
    private String username;
    private Integer employeeId;
    private String employeeName;
    private String fullName;
    private String phone;
    private String email;
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String licenseType;
    private String address;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Integer createdBy;
    private LocalDateTime updatedAt;
    private Integer updatedBy;
}
