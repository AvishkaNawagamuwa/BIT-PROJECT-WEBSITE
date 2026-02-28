package com.sampathgrocery.dto.customer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for customer response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Integer customerId;
    private String customerCode;
    private Integer userId;
    private String fullName;
    private String phone;
    private String alternatePhone;
    private String email;
    private String address;
    private String city;
    private String loyaltyCardNumber;
    private Integer loyaltyPoints;
    private String loyaltyTier;
    private BigDecimal totalPurchases;
    private Integer totalOrders;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
