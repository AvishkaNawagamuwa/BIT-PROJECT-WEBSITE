package com.sampathgrocery.entity.order;

import com.sampathgrocery.entity.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Invoice Entity - Invoice generation for orders
 */
@Entity
@Table(name = "Invoice")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "invoice_id")
    private Integer invoiceId;

    @NotBlank(message = "Invoice number is required")
    @Size(max = 30, message = "Invoice number cannot exceed 30 characters")
    @Column(name = "invoice_number", nullable = false, unique = true, length = 30)
    private String invoiceNumber;

    @NotNull(message = "Order is required")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "invoice_date")
    private LocalDateTime invoiceDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @NotNull(message = "Amount is required")
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "paid_amount", precision = 12, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "balance_amount", precision = 12, scale = 2)
    private BigDecimal balanceAmount;

    @NotNull(message = "Invoice status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    /**
     * Invoice Status Enum
     */
    public enum InvoiceStatus {
        DRAFT, // Invoice created but not sent
        SENT, // Invoice sent to customer
        PAID, // Invoice fully paid
        OVERDUE, // Invoice past due date
        CANCELLED // Invoice cancelled
    }

    /**
     * Calculate balance amount
     */
    public BigDecimal calculateBalance() {
        if (amount != null && paidAmount != null) {
            this.balanceAmount = amount.subtract(paidAmount);
            return this.balanceAmount;
        }
        return BigDecimal.ZERO;
    }

    /**
     * Mark invoice as paid
     */
    public void markAsPaid() {
        this.paidAmount = this.amount;
        this.balanceAmount = BigDecimal.ZERO;
        this.status = InvoiceStatus.PAID;
    }

    /**
     * Add payment to invoice
     */
    public void addPayment(BigDecimal paymentAmount) {
        if (paymentAmount != null && paymentAmount.compareTo(BigDecimal.ZERO) > 0) {
            this.paidAmount = this.paidAmount.add(paymentAmount);
            calculateBalance();

            // Update status
            if (this.balanceAmount.compareTo(BigDecimal.ZERO) <= 0) {
                this.status = InvoiceStatus.PAID;
            }
        }
    }

    @PrePersist
    protected void onCreate() {
        if (invoiceDate == null) {
            invoiceDate = LocalDateTime.now();
        }
        calculateBalance();
    }
}
