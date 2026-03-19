package com.sampathgrocery.service.order;

import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.entity.order.*;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.exception.*;
import com.sampathgrocery.repository.order.*;
import com.sampathgrocery.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Payment Service - Handles payment processing and tracking
 * Supports multiple payment methods and payment status management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final OrderStatusRepository orderStatusRepository;
    private final UserRepository userRepository;

    /**
     * Create a new payment for an order
     */
    @Transactional
    public PaymentResponse createPayment(PaymentCreateRequest request, Integer createdBy) {
        log.info("Creating payment for order ID: {} | Amount: Rs.{}", request.getOrderId(), request.getAmount());

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getMethodId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment method not found with ID: " + request.getMethodId()));

        // Validate payment amount
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        // Calculate total payments already made for this order
        BigDecimal totalPaid = paymentRepository.findByOrderOrderId(order.getOrderId()).stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Check if payment exceeds remaining balance
        BigDecimal remainingBalance = order.getGrandTotal().subtract(totalPaid);
        if (request.getAmount().compareTo(remainingBalance) > 0) {
            throw new BusinessRuleViolationException(
                    String.format("Payment amount (Rs.%.2f) exceeds remaining balance (Rs.%.2f)",
                            request.getAmount(), remainingBalance));
        }

        // Create payment
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setMethod(paymentMethod);
        payment.setAmount(request.getAmount());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setTransactionId(request.getTransactionId());
        payment.setNotes(request.getNotes());

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment created with ID: {} | Status: PENDING", savedPayment.getPaymentId());

        return mapToResponse(savedPayment);
    }

    /**
     * Complete a payment (mark as successful)
     */
    @Transactional
    public PaymentResponse completePayment(Integer paymentId, String transactionId, Integer updatedBy) {
        log.info("Marking payment {} as COMPLETED", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new BusinessRuleViolationException("Payment is already completed");
        }

        if (payment.getStatus() == Payment.PaymentStatus.REFUNDED) {
            throw new BusinessRuleViolationException("Cannot complete a refunded payment");
        }

        payment.markAsCompleted();
        if (transactionId != null) {
            payment.setTransactionId(transactionId);
        }

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment {} marked as COMPLETED", paymentId);

        // Update order status to COMPLETED after successful payment
        Order order = payment.getOrder();
        OrderStatus completedStatus = orderStatusRepository.findByStatusName("COMPLETED")
                .orElseThrow(() -> new ResourceNotFoundException("OrderStatus 'COMPLETED' not found"));
        order.setStatus(completedStatus);
        orderRepository.save(order);
        log.info("Order {} status updated to COMPLETED", order.getOrderId());

        return mapToResponse(savedPayment);
    }

    /**
     * Fail a payment (mark as failed)
     */
    @Transactional
    public PaymentResponse failPayment(Integer paymentId, String failureReason, Integer updatedBy) {
        log.info("Marking payment {} as FAILED", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new BusinessRuleViolationException("Cannot fail a completed payment. Use refund instead.");
        }

        payment.markAsFailed();
        if (failureReason != null) {
            payment.setNotes(payment.getNotes() != null ? payment.getNotes() + "\n" + failureReason : failureReason);
        }

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment {} marked as FAILED", paymentId);

        return mapToResponse(savedPayment);
    }

    /**
     * Refund a payment
     */
    @Transactional
    public PaymentResponse refundPayment(Integer paymentId, String refundReason, Integer updatedBy) {
        log.info("Processing refund for payment {}", paymentId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));

        if (payment.getStatus() != Payment.PaymentStatus.COMPLETED) {
            throw new BusinessRuleViolationException("Can only refund completed payments");
        }

        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        if (refundReason != null) {
            payment.setNotes(payment.getNotes() != null ? payment.getNotes() + "\nREFUND: " + refundReason
                    : "REFUND: " + refundReason);
        }

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment {} refunded successfully", paymentId);

        return mapToResponse(savedPayment);
    }

    /**
     * Get all payments for an order
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByOrderId(Integer orderId) {
        return paymentRepository.findByOrderOrderId(orderId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get payment by ID
     */
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + paymentId));
        return mapToResponse(payment);
    }

    /**
     * Get total payments in date range
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalPaymentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal total = paymentRepository.getTotalPaymentsByDateRange(startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    /**
     * Map Payment entity to PaymentResponse DTO
     */
    private PaymentResponse mapToResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getPaymentId());
        response.setOrderId(payment.getOrder().getOrderId());
        response.setOrderCode(payment.getOrder().getOrderCode());
        response.setMethodId(payment.getMethod().getMethodId());
        response.setMethodName(payment.getMethod().getMethodName());
        response.setAmount(payment.getAmount());
        response.setStatus(payment.getStatus().name());
        response.setTransactionId(payment.getTransactionId());
        response.setReferenceNumber(payment.getReferenceNumber());
        response.setNotes(payment.getNotes());
        response.setPaidAt(payment.getPaidAt());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }
}
