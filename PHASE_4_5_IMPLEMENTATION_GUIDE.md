# ═══════════════════════════════════════════════════════════════════════════════
# SAMPATH GROCERY SYSTEM - PHASE 4 & 5 IMPLEMENTATION GUIDE
# Customer Management + Order Management (POS + Online)
# ═══════════════════════════════════════════════════════════════════════════════

## ✅ COMPLETED COMPONENTS

### 1. ENTITIES (All Created Successfully) ✓
**Phase 4:**
- Customer.java
- CustomerProfile.java

**Phase 5:**
- OrderStatus.java
- PaymentMethod.java
- Cart.java
- CartItem.java
- Order.java
- OrderItem.java
- Payment.java
- Invoice.java
- Discount.java

### 2. DTOs (All Created Successfully) ✓
**Customer DTOs:**
- CustomerCreateRequest
- CustomerUpdateRequest
- CustomerResponse
- CustomerProfileResponse
- CustomerProfileUpdateRequest
- LoyaltyRedemptionRequest
- LoyaltyRedemptionResponse

**Order DTOs:**
- OrderCreateRequest
- OrderItemRequest
- OrderResponse
- OrderItemResponse
- OrderStatusUpdateRequest
- CartItemAddRequest
- CartItemUpdateRequest
- CartResponse
- CartItemResponse
- PaymentCreateRequest
- PaymentResponse
- InvoiceResponse  
- DiscountResponse
- DiscountValidationRequest
- DiscountValidationResponse

### 3. REPOSITORIES (All Created Successfully) ✓
**Customer Repositories:**
- CustomerRepository
- CustomerProfileRepository

**Order Repositories:**
- OrderStatusRepository
- PaymentMethodRepository
- CartRepository
- CartItemRepository
- OrderRepository
- OrderItemRepository
- PaymentRepository
- InvoiceRepository
- DiscountRepository

### 4. UTILITIES (Updated Successfully) ✓
- CodeGenerator (added Customer, Order, Invoice code generators)

### 5. SERVICES (Partially Created)
- CustomerService ✓
- CProfileService ✓ (CustomerProfileService)

---

## 📋 REMAINING IMPLEMENTATION TASKS

The following service files and controllers need to be created. I'll provide the complete implementation for each below.

---

## 🔧 SERVICE LAYER IMPLEMENTATION

### File: OrderService.java
**Location:** `backend/src/main/java/com/sampathgrocery/service/order/OrderService.java`

```java
package com.sampathgrocery.service.order;

import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.entity.customer.Customer;
import com.sampathgrocery.entity.order.*;
import com.sampathgrocery.entity.product.ProductBatch;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.BusinessRuleViolationException;
import com.sampathgrocery.exception.InsufficientStockException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.customer.CustomerRepository;
import com.sampathgrocery.repository.order.*;
import com.sampathgrocery.repository.product.ProductBatchRepository;
import com.sampathgrocery.repository.user.UserRepository;
import com.sampathgrocery.service.customer.CustomerService;
import com.sampathgrocery.service.product.StockMovementService;
import com.sampathgrocery.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Order Service - Handles order creation, updates, and status management
 * Supports both POS (walk-in) and online orders
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusRepository orderStatusRepository;
    private final ProductBatchRepository batchRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final DiscountRepository discountRepository;
    private final CustomerService customerService;
    private final StockMovementService stockMovementService;

    private static final BigDecimal TAX_RATE = BigDecimal.valueOf(0); // 0% tax (adjust as needed)

    /**
     * Create a new order (POS or Online)
     */
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request, Integer createdBy) {
        log.info("Creating new {} order with {} items", request.getOrderType(), request.getItems().size());

        // Validate order type
        Order.OrderType orderType;
        try {
            orderType = Order.OrderType.valueOf(request.getOrderType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order type: " + request.getOrderType());
        }

        // Get default "PENDING" status
        OrderStatus pendingStatus = orderStatusRepository.findByStatusName("PENDING")
                .orElseThrow(() -> new ResourceNotFoundException("OrderStatus 'PENDING' not found"));

        // Generate order code
        String lastCode = orderRepository.findLatestOrderCode();
        String orderCode = CodeGenerator.generateOrderCode(lastCode);

        // Create order entity
        Order order = new Order();
        order.setOrderCode(orderCode);
        order.setOrderType(orderType);
        order.setStatus(pendingStatus);
        order.setNotes(request.getNotes());
        order.setSubtotal(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTaxAmount(request.getTaxAmount() != null ? request.getTaxAmount() : BigDecimal.ZERO);
        order.setDeliveryCharge(request.getDeliveryCharge() != null ? request.getDeliveryCharge() : BigDecimal.ZERO);
        order.setLoyaltyPointsUsed(request.getLoyaltyPointsUsed() != null ? request.getLoyaltyPointsUsed() : 0);
        order.setLoyaltyDiscountAmount(BigDecimal.ZERO);
        order.setGrandTotal(BigDecimal.ZERO);
        order.setLoyaltyPointsEarned(0);

        // Link customer if provided
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));
            order.setCustomer(customer);

            // Calculate loyalty discount if points are used
            if (request.getLoyaltyPointsUsed() != null && request.getLoyaltyPointsUsed() > 0) {
                if (customer.getLoyaltyPoints() < request.getLoyaltyPointsUsed()) {
                    throw new BusinessRuleViolationException("Customer does not have enough loyalty points");
                }
                // 1 point = Rs. 10
                order.setLoyaltyDiscountAmount(BigDecimal.valueOf(request.getLoyaltyPointsUsed() * 10));
            }
        }

        // Set created by user
        if (createdBy != null) {
            User creator = userRepository.findById(createdBy).orElse(null);
            order.setCreatedBy(creator);
        }

        // Save order first to get orderId
        order = orderRepository.save(order);

        // Process order items
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            // Get product batch
            ProductBatch batch = batchRepository.findById(itemReq.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product batch not found with ID: " + itemReq.getBatchId()));

            // Check stock availability
            if (batch.getStockQuantity() < itemReq.getQuantity()) {
                throw new InsufficientStockException(
                    String.format("Insufficient stock for product '%s'. Available: %d, Requested: %d",
                                  batch.getProduct().getProductName(), batch.getStockQuantity(), itemReq.getQuantity())
                );
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setBatch(batch);
            orderItem.setProductName(batch.getProduct().getProductName()); // Snapshot
            orderItem.setQuantity(itemReq.getQuantity());
            
            // Use provided unit price or batch selling price
            BigDecimal unitPrice = itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : batch.getSellingPrice();
            orderItem.setUnitPrice(unitPrice);
            
            // Apply discount if provided
            if (itemReq.getDiscountPercentage() != null && itemReq.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
                orderItem.applyDiscountPercentage(itemReq.getDiscountPercentage());
            } else {
                orderItem.calculateLineTotal();
            }

            orderItems.add(orderItem);
            subtotal = subtotal.add(orderItem.getLineTotal());

            // Deduct stock from batch
            batch.setStockQuantity(batch.getStockQuantity() - itemReq.getQuantity());
            batchRepository.save(batch);

            // Log stock movement
            stockMovementService.logStockMovement(
                batch.getBatchId(),
                "SALE",
                -itemReq.getQuantity(),
                orderCode,
                "Order",
                "Sold via " + orderType.name() + " order",
                createdBy
            );
        }

        order.setItems(orderItems);
        order.setSubtotal(subtotal);

        // Apply discount code if provided
        if (request.getDiscountCode() != null && !request.getDiscountCode().isEmpty()) {
            Discount discount = discountRepository.findValidDiscountByCode(
                request.getDiscountCode(), 
                java.time.LocalDate.now()
            ).orElse(null);

            if (discount != null && discount.isValid()) {
                BigDecimal discountAmount = discount.calculateDiscountAmount(subtotal);
                order.setDiscountAmount(discountAmount);
                discount.incrementUsage();
                discountRepository.save(discount);
            }
        }

        // Calculate totals
        order.calculateTotals();
        order.calculateLoyaltyPointsEarned();

        // Save order (cascades to items)
        Order savedOrder = orderRepository.save(order);

        // Redeem loyalty points from customer if used
        if (request.getCustomerId() != null && request.getLoyaltyPointsUsed() != null && request.getLoyaltyPointsUsed() > 0) {
            Customer customer = savedOrder.getCustomer();
            customer.redeemLoyaltyPoints(request.getLoyaltyPointsUsed());
            customerRepository.save(customer);
        }

        log.info("Order created: {} | Total: Rs.{}", orderCode, savedOrder.getGrandTotal());
        return mapToResponse(savedOrder);
    }

    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));
        return mapToResponse(order);
    }

    /**
     * Get order by code
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with code: " + orderCode));
        return mapToResponse(order);
    }

    /**
     * Get all orders
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by customer ID
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomerId(Integer customerId) {
        return orderRepository.findByCustomerOrderByCreatedAtDesc(customerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by status
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(Integer statusId) {
        return orderRepository.findByStatusStatusId(statusId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get orders by date range
     */
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByDateRange(startDate, endDate).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update order status
     */
    @Transactional
    public OrderResponse updateOrderStatus(Integer orderId, OrderStatusUpdateRequest request, Integer updatedBy) {
        log.info("Updating status for order ID: {} to status ID: {}", orderId, request.getStatusId());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus newStatus = orderStatusRepository.findById(request.getStatusId())
                .orElseThrow(() -> new ResourceNotFoundException("OrderStatus not found with ID: " + request.getStatusId()));

        order.setStatus(newStatus);
        if (request.getNotes() != null) {
            order.setNotes(order.getNotes() + "\n" + request.getNotes());
        }

        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            order.setUpdatedBy(updater);
        }

        // If order is completed, award loyalty points to customer
        if (newStatus.getStatusName().equalsIgnoreCase("COMPLETED") && order.getCustomer() != null) {
            customerService.addLoyaltyPoints(order.getCustomer().getCustomerId(), order.getLoyaltyPointsEarned());
            customerService.updatePurchaseStats(order.getCustomer().getCustomerId(), order.getGrandTotal());
        }

        Order saved = orderRepository.save(order);
        log.info("Order status updated: {} -> {}", order.getOrderCode(), newStatus.getStatusName());
        return mapToResponse(saved);
    }

    /**
     * Cancel order (restore stock)
     */
    @Transactional
    public void cancelOrder(Integer orderId, String reason, Integer updatedBy) {
        log.info("Cancelling order ID: {}", orderId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        // Get CANCELLED status
        OrderStatus cancelledStatus = orderStatusRepository.findByStatusName("CANCELLED")
                .orElseThrow(() -> new ResourceNotFoundException("OrderStatus 'CANCELLED' not found"));

        // Restore stock for all items
        for (OrderItem item : order.getItems()) {
            ProductBatch batch = item.getBatch();
            batch.setStockQuantity(batch.getStockQuantity() + item.getQuantity());
            batchRepository.save(batch);

            // Log stock movement
            stockMovementService.logStockMovement(
                batch.getBatchId(),
                "RETURN",
                item.getQuantity(),
                order.getOrderCode(),
                "Order Cancellation",
                "Order cancelled: " + reason,
                updatedBy
            );
        }

        // Restore loyalty points if they were used
        if (order.getLoyaltyPointsUsed() > 0 && order.getCustomer() != null) {
            Customer customer = order.getCustomer();
            customer.addLoyaltyPoints(order.getLoyaltyPointsUsed());
            customerRepository.save(customer);
        }

        order.setStatus(cancelledStatus);
        order.setNotes(order.getNotes() + "\nCANCELLED: " + reason);
        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            order.setUpdatedBy(updater);
        }

        orderRepository.save(order);
        log.info("Order cancelled: {}", order.getOrderCode());
    }

    /**
     * Map Order entity to OrderResponse DTO
     */
    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setOrderCode(order.getOrderCode());
        response.setCustomerId(order.getCustomer() != null ? order.getCustomer().getCustomerId() : null);
        response.setCustomerName(order.getCustomer() != null ? order.getCustomer().getFullName() : null);
        response.setOrderType(order.getOrderType().name());
        response.setStatus(order.getStatus().getStatusName());
        response.setStatusId(order.getStatus().getStatusId());
        
        // Map items
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
        response.setItems(items);

        response.setSubtotal(order.getSubtotal());
        response.setDiscountAmount(order.getDiscountAmount());
        response.setTaxAmount(order.getTaxAmount());
        response.setDeliveryCharge(order.getDeliveryCharge());
        response.setLoyaltyPointsUsed(order.getLoyaltyPointsUsed());
        response.setLoyaltyDiscountAmount(order.getLoyaltyDiscountAmount());
        response.setGrandTotal(order.getGrandTotal());
        response.setLoyaltyPointsEarned(order.getLoyaltyPointsEarned());
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setCreatedBy(order.getCreatedBy() != null ? order.getCreatedBy().getUsername() : null);
        return response;
    }

    /**
     * Map OrderItem entity to OrderItemResponse DTO
     */
    private OrderItemResponse mapItemToResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setOrderItemId(item.getOrderItemId());
        response.setBatchId(item.getBatch().getBatchId());
        response.setProductName(item.getProductName());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setLineTotal(item.getLineTotal());
        response.setDiscountPercentage(item.getDiscountPercentage());
        response.setDiscountAmount(item.getDiscountAmount());
        return response;
    }
}
```

---

*THIS IMPLEMENTATION CONTINUES...*

I have successfully created **all Phase 4 & 5 entities, DTOs, and repositories**. Due to message length constraints, I'll continue providing the remaining services, controllers, and frontend integration in the next response. Would you like me to continue with:

1. Remaining Services (CartService, PaymentService, InvoiceService, DiscountService)
2. REST Controllers
3. Frontend Integration Guide with API examples  
4. Postman/cURL test examples

Please confirm and I'll continue with the complete implementation!
