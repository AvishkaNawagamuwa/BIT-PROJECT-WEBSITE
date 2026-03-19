package com.sampathgrocery.entity.order;

import com.sampathgrocery.entity.customer.Customer;
import com.sampathgrocery.entity.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Order Entity - Main order table for both POS and online orders
 */
@Entity
@Table(name = "Orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;

    @NotBlank(message = "Order code is required")
    @Size(max = 30, message = "Order code cannot exceed 30 characters")
    @Column(name = "order_code", nullable = false, unique = true, length = 30)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @NotNull(message = "Order type is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", length = 20)
    private OrderType orderType = OrderType.WALK_IN;

    @NotNull(message = "Order status is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "status_id", nullable = false)
    private OrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    @NotNull(message = "Subtotal is required")
    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "delivery_charge", precision = 10, scale = 2)
    private BigDecimal deliveryCharge = BigDecimal.ZERO;

    @Column(name = "loyalty_points_used")
    private Integer loyaltyPointsUsed = 0;

    @Column(name = "loyalty_discount_amount", precision = 10, scale = 2)
    private BigDecimal loyaltyDiscountAmount = BigDecimal.ZERO;

    @NotNull(message = "Grand total is required")
    @Column(name = "grand_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "loyalty_points_earned")
    private Integer loyaltyPointsEarned = 0;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_type", length = 20)
    private FulfillmentType fulfillmentType = FulfillmentType.PICKUP;

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "delivery_city")
    private String deliveryCity;

    @Column(name = "delivery_phone")
    private String deliveryPhone;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    /**
     * Order Type Enum
     */
    public enum OrderType {
        WALK_IN, // POS orders - walk-in customers
        ONLINE, // Online shopping orders
        PHONE // Phone orders
    }

    /**
     * Fulfillment Type Enum
     */
    public enum FulfillmentType {
        PICKUP, // Customer picks up from store
        DELIVERY // Delivered to customer
    }

    /**
     * Helper method to add items to order
     */
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    /**
     * Helper method to remove items from order
     */
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }

    /**
     * Calculate order totals
     */
    public void calculateTotals() {
        // Calculate subtotal from items
        this.subtotal = items.stream()
                .map(OrderItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate grand total
        this.grandTotal = this.subtotal
                .add(this.taxAmount != null ? this.taxAmount : BigDecimal.ZERO)
                .add(this.deliveryCharge != null ? this.deliveryCharge : BigDecimal.ZERO)
                .subtract(this.discountAmount != null ? this.discountAmount : BigDecimal.ZERO)
                .subtract(this.loyaltyDiscountAmount != null ? this.loyaltyDiscountAmount : BigDecimal.ZERO);

        // Ensure grand total is not negative
        if (this.grandTotal.compareTo(BigDecimal.ZERO) < 0) {
            this.grandTotal = BigDecimal.ZERO;
        }
    }

    /**
     * Calculate loyalty points earned (1 point per 100 rupees spent)
     */
    public void calculateLoyaltyPointsEarned() {
        if (this.grandTotal != null && this.grandTotal.compareTo(BigDecimal.ZERO) > 0) {
            this.loyaltyPointsEarned = this.grandTotal.divide(BigDecimal.valueOf(100), 0, BigDecimal.ROUND_DOWN)
                    .intValue();
        }
    }
}
