package com.sampathgrocery.service.delivery;

import com.sampathgrocery.dto.delivery.VehicleRequest;
import com.sampathgrocery.dto.delivery.VehicleResponse;
import com.sampathgrocery.entity.delivery.Vehicle;
import com.sampathgrocery.entity.delivery.VehicleType;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.delivery.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for Vehicle management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    /**
     * Create a new vehicle
     */
    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        log.info("Creating new vehicle: {}", request.getVehicleNumber());

        // Check for duplicate vehicle number
        if (vehicleRepository.findByVehicleNumber(request.getVehicleNumber()).isPresent()) {
            throw new BadRequestException("Vehicle number already exists: " + request.getVehicleNumber());
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleCode(generateVehicleCode());
        mapRequestToEntity(request, vehicle);

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Vehicle created successfully: {}", saved.getVehicleCode());

        return mapEntityToResponse(saved);
    }

    /**
     * Get all vehicles with pagination and type filter
     */
    @Transactional(readOnly = true)
    public Page<VehicleResponse> getAllVehicles(VehicleType type, Pageable pageable) {
        log.info("Fetching vehicles with type filter: {}", type);

        Page<Vehicle> vehicles = vehicleRepository.searchVehicles(type, pageable);
        return vehicles.map(this::mapEntityToResponse);
    }

    /**
     * Get vehicle by ID
     */
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Integer id) {
        log.info("Fetching vehicle with ID: {}", id);

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        return mapEntityToResponse(vehicle);
    }

    /**
     * Update vehicle
     */
    @Transactional
    public VehicleResponse updateVehicle(Integer id, VehicleRequest request) {
        log.info("Updating vehicle with ID: {}", id);

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        // Check for duplicate vehicle number (excluding current vehicle)
        vehicleRepository.findByVehicleNumber(request.getVehicleNumber())
                .ifPresent(existing -> {
                    if (!existing.getVehicleId().equals(id)) {
                        throw new BadRequestException("Vehicle number already exists: " + request.getVehicleNumber());
                    }
                });

        mapRequestToEntity(request, vehicle);

        Vehicle updated = vehicleRepository.save(vehicle);
        log.info("Vehicle updated successfully: {}", updated.getVehicleCode());

        return mapEntityToResponse(updated);
    }

    /**
     * Activate vehicle
     */
    @Transactional
    public VehicleResponse activateVehicle(Integer id) {
        log.info("Activating vehicle with ID: {}", id);

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        vehicle.setIsActive(true);
        Vehicle updated = vehicleRepository.save(vehicle);

        log.info("Vehicle activated: {}", vehicle.getVehicleCode());
        return mapEntityToResponse(updated);
    }

    /**
     * Deactivate vehicle
     */
    @Transactional
    public VehicleResponse deactivateVehicle(Integer id) {
        log.info("Deactivating vehicle with ID: {}", id);

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        vehicle.setIsActive(false);
        Vehicle updated = vehicleRepository.save(vehicle);

        log.info("Vehicle deactivated: {}", vehicle.getVehicleCode());
        return mapEntityToResponse(updated);
    }

    /**
     * Delete vehicle (soft delete)
     */
    @Transactional
    public void deleteVehicle(Integer id) {
        log.info("Deleting vehicle with ID: {}", id);

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));

        // Soft delete by deactivating
        vehicle.setIsActive(false);
        vehicleRepository.save(vehicle);

        log.info("Vehicle deleted (deactivated): {}", vehicle.getVehicleCode());
    }

    /**
     * Map request DTO to entity
     */
    private void mapRequestToEntity(VehicleRequest request, Vehicle vehicle) {
        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYearManufactured(request.getYearManufactured());
        vehicle.setCapacityKg(request.getCapacityKg());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        vehicle.setRevenueLicenseExpiryDate(request.getRevenueLicenseExpiryDate());
    }

    /**
     * Map entity to response DTO
     */
    private VehicleResponse mapEntityToResponse(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();
        response.setVehicleId(vehicle.getVehicleId());
        response.setVehicleCode(vehicle.getVehicleCode());
        response.setVehicleNumber(vehicle.getVehicleNumber());
        response.setVehicleType(vehicle.getVehicleType());
        response.setMake(vehicle.getMake());
        response.setModel(vehicle.getModel());
        response.setYearManufactured(vehicle.getYearManufactured());
        response.setCapacityKg(vehicle.getCapacityKg());
        response.setFuelType(vehicle.getFuelType());
        response.setInsuranceExpiryDate(vehicle.getInsuranceExpiryDate());
        response.setRevenueLicenseExpiryDate(vehicle.getRevenueLicenseExpiryDate());
        response.setIsActive(vehicle.getIsActive());
        response.setCreatedAt(vehicle.getCreatedAt());
        response.setUpdatedAt(vehicle.getUpdatedAt());
        return response;
    }

    /**
     * Generate vehicle code
     */
    private String generateVehicleCode() {
        String latestCode = vehicleRepository.findLatestVehicleCode();
        if (latestCode == null) {
            return "VEH-00001";
        }

        String numberPart = latestCode.substring(4);
        int nextNumber = Integer.parseInt(numberPart) + 1;
        return String.format("VEH-%05d", nextNumber);
    }
}
