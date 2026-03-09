package com.sampathgrocery.service.product;

import com.sampathgrocery.dto.product.UnitOfMeasureRequest;
import com.sampathgrocery.dto.product.UnitOfMeasureResponse;
import com.sampathgrocery.entity.product.UnitOfMeasure;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.product.ProductRepository;
import com.sampathgrocery.repository.product.UnitOfMeasureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Unit of Measure Service
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class UnitOfMeasureService {

    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final ProductRepository productRepository;

    /**
     * Get all units
     */
    public List<UnitOfMeasureResponse> getAllUnits() {
        return unitOfMeasureRepository.findAllOrderByName().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all active units
     */
    public List<UnitOfMeasureResponse> getAllActiveUnits() {
        return unitOfMeasureRepository.findAllActive().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get unit by ID
     */
    public UnitOfMeasureResponse getUnitById(Integer id) {
        UnitOfMeasure unit = unitOfMeasureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));
        return toResponse(unit);
    }

    /**
     * Create new unit
     */
    public UnitOfMeasureResponse createUnit(UnitOfMeasureRequest request, Integer createdBy) {
        // Check if unit code already exists
        if (unitOfMeasureRepository.existsByUnitCode(request.getUnitCode())) {
            throw new IllegalArgumentException("Unit code already exists: " + request.getUnitCode());
        }

        // Check if unit name already exists
        if (unitOfMeasureRepository.existsByUnitName(request.getUnitName())) {
            throw new IllegalArgumentException("Unit name already exists: " + request.getUnitName());
        }

        UnitOfMeasure unit = new UnitOfMeasure();
        unit.setUnitName(request.getUnitName());
        unit.setUnitCode(request.getUnitCode().toUpperCase()); // Store code in uppercase
        unit.setDescription(request.getDescription());
        unit.setStatus(request.getStatus());
        unit.setCreatedBy(createdBy);
        unit.setUpdatedBy(createdBy);

        unit = unitOfMeasureRepository.save(unit);
        log.info("Created new unit: {} ({})", unit.getUnitName(), unit.getUnitCode());

        return toResponse(unit);
    }

    /**
     * Update unit
     */
    public UnitOfMeasureResponse updateUnit(Integer id, UnitOfMeasureRequest request, Integer updatedBy) {
        UnitOfMeasure unit = unitOfMeasureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));

        // Check if unit code already exists (excluding current unit)
        if (unitOfMeasureRepository.existsByUnitCodeAndNotUnitId(request.getUnitCode(), id)) {
            throw new IllegalArgumentException("Unit code already exists: " + request.getUnitCode());
        }

        // Check if unit name already exists (excluding current unit)
        if (unitOfMeasureRepository.existsByUnitNameAndNotUnitId(request.getUnitName(), id)) {
            throw new IllegalArgumentException("Unit name already exists: " + request.getUnitName());
        }

        unit.setUnitName(request.getUnitName());
        unit.setUnitCode(request.getUnitCode().toUpperCase());
        unit.setDescription(request.getDescription());
        unit.setStatus(request.getStatus());
        unit.setUpdatedBy(updatedBy);

        unit = unitOfMeasureRepository.save(unit);
        log.info("Updated unit: {} ({})", unit.getUnitName(), unit.getUnitCode());

        return toResponse(unit);
    }

    /**
     * Delete unit
     */
    public void deleteUnit(Integer id) {
        UnitOfMeasure unit = unitOfMeasureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));

        // Check if unit is used by any products
        Long productCount = productRepository.countByUnitUnitId(id);
        if (productCount > 0) {
            throw new IllegalStateException("Cannot delete unit. It is used by " + productCount + " product(s).");
        }

        unitOfMeasureRepository.delete(unit);
        log.info("Deleted unit: {} ({})", unit.getUnitName(), unit.getUnitCode());
    }

    /**
     * Toggle unit status
     */
    public UnitOfMeasureResponse toggleUnitStatus(Integer id, Integer updatedBy) {
        UnitOfMeasure unit = unitOfMeasureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit not found with id: " + id));

        unit.setStatus(unit.getStatus() == UnitOfMeasure.Status.ACTIVE ? UnitOfMeasure.Status.INACTIVE : UnitOfMeasure.Status.ACTIVE);
        unit.setUpdatedBy(updatedBy);

        unit = unitOfMeasureRepository.save(unit);
        log.info("Toggled unit status: {} - {}", unit.getUnitName(), unit.getStatus());

        return toResponse(unit);
    }

    /**
     * Convert entity to response DTO
     */
    private UnitOfMeasureResponse toResponse(UnitOfMeasure unit) {
        UnitOfMeasureResponse response = new UnitOfMeasureResponse();
        response.setUnitId(unit.getUnitId());
        response.setUnitName(unit.getUnitName());
        response.setUnitCode(unit.getUnitCode());
        response.setDescription(unit.getDescription());
        response.setStatus(unit.getStatus());
        response.setCreatedAt(unit.getCreatedAt());

        // Get product count
        Long productCount = productRepository.countByUnitUnitId(unit.getUnitId());
        response.setProductCount(productCount.intValue());

        return response;
    }
}
