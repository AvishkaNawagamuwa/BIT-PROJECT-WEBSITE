package com.sampathgrocery.service.order;

import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.entity.order.*;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.exception.*;
import com.sampathgrocery.repository.order.*;
import com.sampathgrocery.repository.user.UserRepository;
import com.sampathgrocery.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Invoice Service - Handles invoice generation and management
 * Automatically creates invoices for orders and tracks payment status
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    /**
     * Generate invoice for an order
     */
    @Transactional
    public InvoiceResponse generateInvoice(Integer orderId, Integer createdBy) {
        log.info("Generating invoice for order ID: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Check if invoice already exists
        if (invoiceRepository.findByOrderOrderId(order.getOrderId()).orElse(null) != null) {
            log.warn("Invoice already exists for order {}", order.getOrderCode());
            return mapToResponse(invoiceRepository.findByOrderOrderId(order.getOrderId()).orElse(null));
        }

        // Generate invoice number
        String lastInvoice = invoiceRepository.findLatestInvoiceNumber();
        String invoiceNumber = CodeGenerator.generateInvoiceNumber(lastInvoice);

        // Create invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setOrder(order);
        invoice.setAmount(order.getGrandTotal());
        invoice.setStatus(Invoice.InvoiceStatus.DRAFT);
        invoice.setInvoiceDate(LocalDate.now().atStartOfDay()); // Convert LocalDate to LocalDateTime
        invoice.setDueDate(LocalDate.now().plusDays(30)); // Default 30 days

        if (createdBy != null) {
            User creator = userRepository.findById(createdBy).orElse(null);
            invoice.setCreatedBy(creator);
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice generated: {}", invoiceNumber);

        return mapToResponse(savedInvoice);
    }

    /**
     * Get invoice by ID
     */
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Integer invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));
        return mapToResponse(invoice);
    }

    /**
     * Get invoice by invoice number
     */
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByNumber(String invoiceNumber) {
        Invoice invoice = invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with number: " + invoiceNumber));
        return mapToResponse(invoice);
    }

    /**
     * Get invoice by order ID
     */
    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByOrderId(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        if (invoiceRepository.findByOrderOrderId(order.getOrderId()).orElse(null) == null) {
            throw new ResourceNotFoundException("No invoice found for order: " + order.getOrderCode());
        }

        return mapToResponse(invoiceRepository.findByOrderOrderId(order.getOrderId()).orElse(null));
    }

    /**
     * Update invoice status
     */
    @Transactional
    public InvoiceResponse updateInvoiceStatus(Integer invoiceId, String status, Integer updatedBy) {
        log.info("Updating invoice {} status to {}", invoiceId, status);

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        try {
            Invoice.InvoiceStatus newStatus = Invoice.InvoiceStatus.valueOf(status.toUpperCase());
            invoice.setStatus(newStatus);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid invoice status: " + status);
        }

        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            // invoice.setUpdatedBy(updater); // Field does not exist in Invoice entity
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice status updated to {}", status);

        return mapToResponse(savedInvoice);
    }

    /**
     * Mark invoice as paid
     */
    @Transactional
    public InvoiceResponse markInvoiceAsPaid(Integer invoiceId, Integer updatedBy) {
        log.info("Marking invoice {} as PAID", invoiceId);

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with ID: " + invoiceId));

        // Check if order has sufficient payments
        BigDecimal totalPaid = paymentRepository.findByOrderOrderId(invoice.getOrder().getOrderId()).stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalPaid.compareTo(invoice.getAmount()) < 0) {
            throw new BusinessRuleViolationException(
                    String.format("Insufficient payments. Total paid: Rs.%.2f, Invoice amount: Rs.%.2f",
                            totalPaid, invoice.getAmount()));
        }

        invoice.markAsPaid();

        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            // invoice.setUpdatedBy(updater); // Field does not exist in Invoice entity
        }

        Invoice savedInvoice = invoiceRepository.save(invoice);
        log.info("Invoice {} marked as PAID", invoice.getInvoiceNumber());

        return mapToResponse(savedInvoice);
    }

    /**
     * Get all overdue invoices
     */
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getOverdueInvoices() {
        return invoiceRepository.findOverdueInvoices(LocalDate.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all invoices
     */
    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map Invoice entity to InvoiceResponse DTO
     */
    private InvoiceResponse mapToResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.setInvoiceId(invoice.getInvoiceId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setOrderId(invoice.getOrder().getOrderId());
        response.setOrderCode(invoice.getOrder().getOrderCode());
        response.setCustomerId(
                invoice.getOrder().getCustomer() != null ? invoice.getOrder().getCustomer().getCustomerId() : null);
        response.setCustomerName(
                invoice.getOrder().getCustomer() != null ? invoice.getOrder().getCustomer().getFullName() : null);
        response.setAmount(invoice.getAmount());

        // Calculate paid amount from order payments
        BigDecimal paidAmount = paymentRepository.findByOrderOrderId(invoice.getOrder().getOrderId()).stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setPaidAmount(paidAmount);

        BigDecimal balance = invoice.calculateBalance();
        response.setBalance(balance);

        response.setStatus(invoice.getStatus().name());
        response.setInvoiceDate(invoice.getInvoiceDate());
        response.setDueDate(invoice.getDueDate());
        response.setPaymentDate(null); // Payment date not tracked on invoice
        response.setCreatedAt(invoice.getCreatedAt());
        response.setCreatedBy(invoice.getCreatedBy() != null ? invoice.getCreatedBy().getUsername() : null);

        return response;
    }
}
