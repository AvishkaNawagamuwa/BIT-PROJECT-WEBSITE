package com.sampathgrocery.service.delivery;

import com.sampathgrocery.dto.delivery.*;
import com.sampathgrocery.entity.delivery.*;
import com.sampathgrocery.entity.order.Order;
import com.sampathgrocery.exception.InvalidStatusTransitionException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.delivery.*;
import com.sampathgrocery.repository.order.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Service for Delivery management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final DeliveryStatusHistoryRepository statusHistoryRepository;

    /**
     * Create a new delivery
     */
    @Transactional
    public DeliveryResponse createDelivery(DeliveryRequest request) {
        log.info("Creating new delivery for order ID: {}", request.getOrderId());

        // Verify order exists
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        Delivery delivery = new Delivery();
        delivery.setDeliveryCode(generateDeliveryCode());
        delivery.setOrder(order);
        delivery.setDeliveryAddress(request.getDeliveryAddress());
        delivery.setDeliveryCity(request.getDeliveryCity());
        delivery.setCustomerPhone(request.getCustomerPhone());
        delivery.setScheduledDate(request.getScheduledDate());
        delivery.setScheduledTime(request.getScheduledTime());
        delivery.setDeliveryNotes(request.getDeliveryNotes());
        delivery.setStatus(DeliveryStatus.PENDING);

        Delivery saved = deliveryRepository.save(delivery);

        // Create initial status history
        createStatusHistory(saved, DeliveryStatus.PENDING, "Delivery created", null, null);

        log.info("Delivery created successfully: {}", saved.getDeliveryCode());
        return mapEntityToResponse(saved);
    }

    /**
     * Get all deliveries with pagination and filters
     */
    @Transactional(readOnly = true)
    public Page<DeliveryResponse> getAllDeliveries(DeliveryStatus status, LocalDate date, Pageable pageable) {
        log.info("Fetching deliveries with status: {} and date: {}", status, date);

        Page<Delivery> deliveries = deliveryRepository.searchDeliveries(status, date, pageable);
        return deliveries.map(this::mapEntityToResponse);
    }

    /**
     * Get delivery by ID
     */
    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryById(Integer id) {
        log.info("Fetching delivery with ID: {}", id);

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with ID: " + id));

        return mapEntityToResponse(delivery);
    }

    /**
     * Assign driver and vehicle to delivery
     */
    @Transactional
    public DeliveryResponse assignDelivery(Integer id, AssignDeliveryRequest request) {
        log.info("Assigning delivery ID: {} to driver: {} and vehicle: {}", 
                id, request.getDriverId(), request.getVehicleId());

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with ID: " + id));

        // Verify driver exists and is active
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + request.getDriverId()));
        
        if (!driver.getIsActive()) {
            throw new InvalidStatusTransitionException("Driver is not active");
        }

        // Verify vehicle exists and is active
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));
        
        if (!vehicle.getIsActive()) {
            throw new InvalidStatusTransitionException("Vehicle is not active");
        }

        delivery.setDriver(driver);
        delivery.setVehicle(vehicle);
        
        if (request.getScheduledDate() != null) {
            delivery.setScheduledDate(request.getScheduledDate());
        }
        
        if (request.getScheduledTime() != null) {
            delivery.setScheduledTime(request.getScheduledTime());
        }

        // Update status to ASSIGNED
        updateDeliveryStatus(delivery, DeliveryStatus.ASSIGNED, 
                "Assigned to driver: " + driver.getFullName(), null, null);

        Delivery updated = deliveryRepository.save(delivery);
        log.info("Delivery assigned successfully: {}", delivery.getDeliveryCode());

        return mapEntityToResponse(updated);
    }

    /**
     * Update delivery status
     */
    @Transactional
    public DeliveryResponse updateStatus(Integer id, UpdateDeliveryStatusRequest request) {
        log.info("Updating delivery ID: {} status to: {}", id, request.getStatus());

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with ID: " + id));

        // Validate status transition
        if (!delivery.getStatus().canTransitionTo(request.getStatus())) {
            throw new InvalidStatusTransitionException(
                    String.format("Cannot transition from %s to %s", 
                            delivery.getStatus(), request.getStatus()));
        }

        updateDeliveryStatus(delivery, request.getStatus(), request.getNotes(), 
                request.getLatitude(), request.getLongitude());

        // Apply time rules
        if (request.getStatus() == DeliveryStatus.PICKED_UP && delivery.getActualPickupTime() == null) {
            delivery.setActualPickupTime(LocalDateTime.now());
        } else if (request.getStatus() == DeliveryStatus.DELIVERED && delivery.getActualDeliveryTime() == null) {
            delivery.setActualDeliveryTime(LocalDateTime.now());
        }

        Delivery updated = deliveryRepository.save(delivery);
        log.info("Delivery status updated successfully: {}", delivery.getDeliveryCode());

        return mapEntityToResponse(updated);
    }

    /**
     * Update proof of delivery
     */
    @Transactional
    public DeliveryResponse updateProof(Integer id, UpdateProofRequest request) {
        log.info("Updating proof of delivery for ID: {}", id);

        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with ID: " + id));

        delivery.setProofOfDeliveryUrl(request.getProofOfDeliveryUrl());

        Delivery updated = deliveryRepository.save(delivery);
        log.info("Proof of delivery updated: {}", delivery.getDeliveryCode());

        return mapEntityToResponse(updated);
    }

    /**
     * Helper method to update status and create history
     */
    private void updateDeliveryStatus(Delivery delivery, DeliveryStatus newStatus, 
                                       String notes, java.math.BigDecimal lat, java.math.BigDecimal lng) {
        delivery.setStatus(newStatus);
        createStatusHistory(delivery, newStatus, notes, lat, lng);
    }

    /**
     * Create status history entry
     */
    private void createStatusHistory(Delivery delivery, DeliveryStatus status, 
                                       String notes, java.math.BigDecimal lat, java.math.BigDecimal lng) {
        DeliveryStatusHistory history = new DeliveryStatusHistory();
        history.setDelivery(delivery);
        history.setStatus(status);
        history.setNotes(notes);
        history.setLocationLatitude(lat);
        history.setLocationLongitude(lng);
        
        statusHistoryRepository.save(history);
        log.debug("Status history created for delivery: {} with status: {}", 
                delivery.getDeliveryCode(), status);
    }

    /**
     * Map entity to response DTO
     */
    private DeliveryResponse mapEntityToResponse(Delivery delivery) {
        DeliveryResponse response = new DeliveryResponse();
        response.setDeliveryId(delivery.getDeliveryId());
        response.setDeliveryCode(delivery.getDeliveryCode());
        response.setOrderId(delivery.getOrder().getOrderId());
        response.setOrderCode(delivery.getOrder().getOrderCode());
        response.setDriverId(delivery.getDriver() != null ? delivery.getDriver().getDriverId() : null);
        response.setDriverName(delivery.getDriver() != null ? delivery.getDriver().getFullName() : null);
        response.setVehicleId(delivery.getVehicle() != null ? delivery.getVehicle().getVehicleId() : null);
        response.setVehicleNumber(delivery.getVehicle() != null ? delivery.getVehicle().getVehicleNumber() : null);
        response.setDeliveryAddress(delivery.getDeliveryAddress());
        response.setDeliveryCity(delivery.getDeliveryCity());
        response.setCustomerPhone(delivery.getCustomerPhone());
        response.setScheduledDate(delivery.getScheduledDate());
        response.setScheduledTime(delivery.getScheduledTime());
        response.setActualPickupTime(delivery.getActualPickupTime());
        response.setActualDeliveryTime(delivery.getActualDeliveryTime());
        response.setStatus(delivery.getStatus());
        response.setDeliveryNotes(delivery.getDeliveryNotes());
        response.setProofOfDeliveryUrl(delivery.getProofOfDeliveryUrl());
        response.setCreatedAt(delivery.getCreatedAt());
        response.setUpdatedAt(delivery.getUpdatedAt());
        return response;
    }

    /**
     * Generate delivery code
     */
    private String generateDeliveryCode() {
        String latestCode = deliveryRepository.findLatestDeliveryCode();
        if (latestCode == null) {
            return "DEL-00001";
        }

        String numberPart = latestCode.substring(4);
        int nextNumber = Integer.parseInt(numberPart) + 1;
        return String.format("DEL-%05d", nextNumber);
    }
}
