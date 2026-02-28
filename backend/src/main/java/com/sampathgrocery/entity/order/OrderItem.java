package com.sampathgrocery.entity.order;

import com.sampathgrocery.entity.product.ProductBatch;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Order Item Entity - Individual line items in an order
 * Stores a snapshot of product information at time of purchase
 */
@Entity
@Table(name = "OrderItem")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_item_id")
    private Integer orderItemId;

    @NotNull(message = "Order is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @NotNull(message = "Product batch is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private ProductBatch batch;

    /**
     * Snapshot of product name at time of order
     * Stored so we have historical data even if product is deleted/renamed
     */
    @NotBlank(message = "Product name is required")
    @Size(max = 200, message = "Product name cannot exceed 200 characters")
    @Column(name = "product_name", nullable = false, length = 200)
    private String productName;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @NotNull(message = "Line total is required")
    @Column(name = "line_total", nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;

    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Calculate line total based on quantity, unit price, and discount
     */
    public void calculateLineTotal() {
        if (quantity != null && unitPrice != null) {
            BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(quantity));

            // Apply discount if any
            if (discountAmount != null && discountAmount.compareTo(BigDecimal.ZERO) > 0) {
                total = total.subtract(discountAmount);
            }

            this.lineTotal = total.max(BigDecimal.ZERO); // Ensure not negative
        }
    }

    /**
     * Apply discount percentage
     */
    public void applyDiscountPercentage(BigDecimal percentage) {
        if (percentage != null && percentage.compareTo(BigDecimal.ZERO) > 0) {
            this.discountPercentage = percentage;
            BigDecimal baseTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            this.discountAmount = baseTotal.multiply(percentage).divide(BigDecimal.valueOf(100), 2,
                    java.math.RoundingMode.HALF_UP);
            calculateLineTotal();
        }
    }
}
