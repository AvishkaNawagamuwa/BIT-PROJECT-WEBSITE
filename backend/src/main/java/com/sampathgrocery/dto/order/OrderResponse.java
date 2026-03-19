package com.sampathgrocery.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for order response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Integer orderId;
    private String orderCode;
    private Integer customerId;
    private String customerName;
    private String orderType;
    private String status;
    private Integer statusId;
    private List<OrderItemResponse> items;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal deliveryCharge;
    private Integer loyaltyPointsUsed;
    private BigDecimal loyaltyDiscountAmount;
    private BigDecimal grandTotal;
    private Integer loyaltyPointsEarned;
    private String fulfillmentType;
    private String deliveryAddress;
    private String deliveryCity;
    private String deliveryPhone;
    private LocalDateTime createdAt;
    private String createdBy;
}
