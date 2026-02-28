package com.sampathgrocery.entity.order;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Payment Entity - Tracks payments for orders
 * Supports multiple payment methods per order (split payments)
 */
@Entity
@Table(name = "Payment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Integer paymentId;

    @NotNull(message = "Order is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @NotNull(message = "Payment method is required")
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "method_id", nullable = false)
    private PaymentMethod method;

    @NotNull(message = "Amount is required")
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Payment status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private PaymentStatus status = PaymentStatus.PENDING;

    /**
     * Bank or payment gateway transaction reference
     */
    @Size(max = 100, message = "Transaction ID cannot exceed 100 characters")
    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Size(max = 100, message = "Reference number cannot exceed 100 characters")
    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Payment Status Enum
     */
    public enum PaymentStatus {
        PENDING, // Payment initiated but not confirmed
        COMPLETED, // Payment successfully processed
        FAILED, // Payment failed
        REFUNDED // Payment refunded
    }

    /**
     * Mark payment as completed
     */
    public void markAsCompleted() {
        this.status = PaymentStatus.COMPLETED;
        this.paidAt = LocalDateTime.now();
    }

    /**
     * Mark payment as failed
     */
    public void markAsFailed() {
        this.status = PaymentStatus.FAILED;
    }

    /**
     * Mark payment as refunded
     */
    public void markAsRefunded() {
        this.status = PaymentStatus.REFUNDED;
    }
}
