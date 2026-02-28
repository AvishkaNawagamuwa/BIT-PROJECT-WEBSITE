package com.sampathgrocery.service.delivery;

import com.sampathgrocery.dto.delivery.*;
import com.sampathgrocery.entity.delivery.*;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.delivery.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for DeliveryRoute management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryRouteService {

    private final DeliveryRouteRepository routeRepository;
    private final DeliveryRouteItemRepository routeItemRepository;
    private final DeliveryRepository deliveryRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    /**
     * Create a new delivery route
     */
    @Transactional
    public DeliveryRouteResponse createRoute(DeliveryRouteRequest request) {
        log.info("Creating new delivery route: {}", request.getRouteName());

        DeliveryRoute route = new DeliveryRoute();
        route.setRouteName(request.getRouteName());
        route.setRouteDate(request.getRouteDate());
        route.setNotes(request.getNotes());
        route.setStatus(RouteStatus.PLANNED);

        // Set driver if provided
        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Driver not found with ID: " + request.getDriverId()));
            route.setDriver(driver);
        }

        // Set vehicle if provided
        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle not found with ID: " + request.getVehicleId()));
            route.setVehicle(vehicle);
        }

        DeliveryRoute saved = routeRepository.save(route);
        log.info("Delivery route created successfully with ID: {}", saved.getRouteId());

        return mapEntityToResponse(saved);
    }

    /**
     * Get all routes with pagination and date filter
     */
    @Transactional(readOnly = true)
    public Page<DeliveryRouteResponse> getAllRoutes(LocalDate date, Pageable pageable) {
        log.info("Fetching routes with date filter: {}", date);

        Page<DeliveryRoute> routes = routeRepository.searchRoutes(date, pageable);
        return routes.map(this::mapEntityToResponse);
    }

    /**
     * Get route by ID
     */
    @Transactional(readOnly = true)
    public DeliveryRouteResponse getRouteById(Integer id) {
        log.info("Fetching route with ID: {}", id);

        DeliveryRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + id));

        return mapEntityToResponse(route);
    }

    /**
     * Update route
     */
    @Transactional
    public DeliveryRouteResponse updateRoute(Integer id, DeliveryRouteRequest request) {
        log.info("Updating route with ID: {}", id);

        DeliveryRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + id));

        route.setRouteName(request.getRouteName());
        route.setRouteDate(request.getRouteDate());
        route.setNotes(request.getNotes());

        // Update driver if provided
        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Driver not found with ID: " + request.getDriverId()));
            route.setDriver(driver);
        } else {
            route.setDriver(null);
        }

        // Update vehicle if provided
        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle not found with ID: " + request.getVehicleId()));
            route.setVehicle(vehicle);
        } else {
            route.setVehicle(null);
        }

        DeliveryRoute updated = routeRepository.save(route);
        log.info("Route updated successfully: {}", updated.getRouteId());

        return mapEntityToResponse(updated);
    }

    /**
     * Delete route
     */
    @Transactional
    public void deleteRoute(Integer id) {
        log.info("Deleting route with ID: {}", id);

        DeliveryRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + id));

        // Delete all route items first
        routeItemRepository.deleteByRouteId(id);

        // Delete the route
        routeRepository.delete(route);

        log.info("Route deleted successfully: {}", id);
    }

    /**
     * Update route status
     */
    @Transactional
    public DeliveryRouteResponse updateRouteStatus(Integer id, UpdateRouteStatusRequest request) {
        log.info("Updating route ID: {} status to: {}", id, request.getStatus());

        DeliveryRoute route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + id));

        route.setStatus(request.getStatus());

        // Set start/end time based on status
        if (request.getStatus() == RouteStatus.IN_PROGRESS && route.getStartTime() == null) {
            route.setStartTime(LocalDateTime.now());
        } else if (request.getStatus() == RouteStatus.COMPLETED && route.getEndTime() == null) {
            route.setEndTime(LocalDateTime.now());
        }

        DeliveryRoute updated = routeRepository.save(route);
        log.info("Route status updated successfully");

        return mapEntityToResponse(updated);
    }

    /**
     * Add delivery to route
     */
    @Transactional
    public DeliveryRouteResponse addDeliveryToRoute(Integer routeId, AddDeliveryToRouteRequest request) {
        log.info("Adding delivery ID: {} to route ID: {}", request.getDeliveryId(), routeId);

        DeliveryRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + routeId));

        Delivery delivery = deliveryRepository.findById(request.getDeliveryId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Delivery not found with ID: " + request.getDeliveryId()));

        // Check if delivery already in route
        if (routeItemRepository.findByRouteIdAndDeliveryId(routeId, request.getDeliveryId()).isPresent()) {
            throw new BadRequestException("Delivery already exists in this route");
        }

        // Create route item
        DeliveryRouteItem routeItem = new DeliveryRouteItem();
        routeItem.setRoute(route);
        routeItem.setDelivery(delivery);
        routeItem.setStopOrder(request.getStopOrder());

        routeItemRepository.save(routeItem);

        // Update route totals
        updateRouteTotals(route);

        log.info("Delivery added to route successfully");
        return mapEntityToResponse(route);
    }

    /**
     * Remove delivery from route
     */
    @Transactional
    public DeliveryRouteResponse removeDeliveryFromRoute(Integer routeId, RemoveDeliveryFromRouteRequest request) {
        log.info("Removing delivery ID: {} from route ID: {}", request.getDeliveryId(), routeId);

        DeliveryRoute route = routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with ID: " + routeId));

        DeliveryRouteItem routeItem = routeItemRepository.findByRouteIdAndDeliveryId(routeId, request.getDeliveryId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found in this route"));

        routeItemRepository.delete(routeItem);

        // Update route totals
        updateRouteTotals(route);

        log.info("Delivery removed from route successfully");
        return mapEntityToResponse(route);
    }

    /**
     * Get route items (deliveries in route)
     */
    @Transactional(readOnly = true)
    public List<DeliveryRouteItemResponse> getRouteItems(Integer routeId) {
        log.info("Fetching items for route ID: {}", routeId);

        // Verify route exists
        if (!routeRepository.existsById(routeId)) {
            throw new ResourceNotFoundException("Route not found with ID: " + routeId);
        }

        List<DeliveryRouteItem> items = routeItemRepository.findByRouteIdOrderByStopOrder(routeId);

        return items.stream()
                .map(this::mapRouteItemToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update route totals based on deliveries
     */
    private void updateRouteTotals(DeliveryRoute route) {
        List<DeliveryRouteItem> items = routeItemRepository.findByRouteIdOrderByStopOrder(route.getRouteId());

        route.setTotalDeliveries(items.size());

        long completed = items.stream()
                .filter(item -> item.getDelivery().getStatus() == DeliveryStatus.DELIVERED)
                .count();
        route.setCompletedDeliveries((int) completed);

        long failed = items.stream()
                .filter(item -> item.getDelivery().getStatus() == DeliveryStatus.FAILED)
                .count();
        route.setFailedDeliveries((int) failed);

        routeRepository.save(route);
    }

    /**
     * Map entity to response DTO
     */
    private DeliveryRouteResponse mapEntityToResponse(DeliveryRoute route) {
        DeliveryRouteResponse response = new DeliveryRouteResponse();
        response.setRouteId(route.getRouteId());
        response.setRouteName(route.getRouteName());
        response.setDriverId(route.getDriver() != null ? route.getDriver().getDriverId() : null);
        response.setDriverName(route.getDriver() != null ? route.getDriver().getFullName() : null);
        response.setVehicleId(route.getVehicle() != null ? route.getVehicle().getVehicleId() : null);
        response.setVehicleNumber(route.getVehicle() != null ? route.getVehicle().getVehicleNumber() : null);
        response.setRouteDate(route.getRouteDate());
        response.setTotalDeliveries(route.getTotalDeliveries());
        response.setCompletedDeliveries(route.getCompletedDeliveries());
        response.setFailedDeliveries(route.getFailedDeliveries());
        response.setStartTime(route.getStartTime());
        response.setEndTime(route.getEndTime());
        response.setStatus(route.getStatus());
        response.setTotalDistanceKm(route.getTotalDistanceKm());
        response.setNotes(route.getNotes());
        response.setCreatedAt(route.getCreatedAt());
        response.setUpdatedAt(route.getUpdatedAt());
        return response;
    }

    /**
     * Map route item to response DTO
     */
    private DeliveryRouteItemResponse mapRouteItemToResponse(DeliveryRouteItem item) {
        DeliveryRouteItemResponse response = new DeliveryRouteItemResponse();
        response.setRouteItemId(item.getRouteItemId());
        response.setRouteId(item.getRoute().getRouteId());
        response.setDeliveryId(item.getDelivery().getDeliveryId());
        response.setDeliveryCode(item.getDelivery().getDeliveryCode());
        response.setDeliveryAddress(item.getDelivery().getDeliveryAddress());
        response.setCustomerPhone(item.getDelivery().getCustomerPhone());
        response.setStatus(item.getDelivery().getStatus().name());
        response.setStopOrder(item.getStopOrder());
        return response;
    }
}
