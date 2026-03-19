package com.sampathgrocery.service.order;

import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.entity.customer.Customer;
import com.sampathgrocery.entity.order.*;
import com.sampathgrocery.entity.product.ProductBatch;
import com.sampathgrocery.entity.product.StockMovement;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.exception.*;
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
    private final OrderStatusRepository orderStatusRepository;
    private final ProductBatchRepository batchRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final DiscountRepository discountRepository;
    private final CustomerService customerService;
    private final StockMovementService stockMovementService;

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

        // Validate fulfillment type
        Order.FulfillmentType fulfillmentType;
        try {
            fulfillmentType = Order.FulfillmentType.valueOf(request.getFulfillmentType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid fulfillment type: " + request.getFulfillmentType());
        }

        // Validate delivery address if fulfillment type is DELIVERY
        if (fulfillmentType == Order.FulfillmentType.DELIVERY) {
            if (request.getDeliveryAddress() == null || request.getDeliveryAddress().trim().isEmpty()) {
                throw new BadRequestException("Delivery address is required for delivery orders");
            }
            if (request.getDeliveryCity() == null || request.getDeliveryCity().trim().isEmpty()) {
                throw new BadRequestException("Delivery city is required for delivery orders");
            }
            if (request.getDeliveryPhone() == null || request.getDeliveryPhone().trim().isEmpty()) {
                throw new BadRequestException("Delivery phone is required for delivery orders");
            }
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
        order.setFulfillmentType(fulfillmentType);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setDeliveryCity(request.getDeliveryCity());
        order.setDeliveryPhone(request.getDeliveryPhone());
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
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Customer not found with ID: " + request.getCustomerId()));
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
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product batch not found with ID: " + itemReq.getBatchId()));

            // Check stock availability
            if (batch.getStockQuantity() < itemReq.getQuantity()) {
                throw new InsufficientStockException(
                        String.format("Insufficient stock for product '%s'. Available: %d, Requested: %d",
                                batch.getProduct().getProductName(), batch.getStockQuantity(), itemReq.getQuantity()));
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
            if (itemReq.getDiscountPercentage() != null
                    && itemReq.getDiscountPercentage().compareTo(BigDecimal.ZERO) > 0) {
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
            stockMovementService.logMovement(
                    batch.getBatchId(),
                    StockMovement.MovementType.SALE,
                    itemReq.getQuantity(),
                    orderCode,
                    "Order",
                    "Sold via " + orderType.name() + " order",
                    createdBy);
        }

        order.setItems(orderItems);
        order.setSubtotal(subtotal);

        // Calculate totals
        order.calculateTotals();
        order.calculateLoyaltyPointsEarned();

        // Save order (cascades to items)
        Order savedOrder = orderRepository.save(order);

        // Redeem loyalty points from customer if used
        if (request.getCustomerId() != null && request.getLoyaltyPointsUsed() != null
                && request.getLoyaltyPointsUsed() > 0) {
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
     * Update order status
     */
    @Transactional
    public OrderResponse updateOrderStatus(Integer orderId, OrderStatusUpdateRequest request, Integer updatedBy) {
        log.info("Updating status for order ID: {} to status ID: {}", orderId, request.getStatusId());

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        OrderStatus newStatus = orderStatusRepository.findById(request.getStatusId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("OrderStatus not found with ID: " + request.getStatusId()));

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
        response.setFulfillmentType(order.getFulfillmentType() != null ? order.getFulfillmentType().name() : null);
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setDeliveryCity(order.getDeliveryCity());
        response.setDeliveryPhone(order.getDeliveryPhone());
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
