package com.sampathgrocery.service.supplier;

import com.sampathgrocery.dto.supplier.SupplierRequest;
import com.sampathgrocery.dto.supplier.SupplierResponse;
import com.sampathgrocery.entity.supplier.Supplier;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.supplier.SupplierRepository;
import com.sampathgrocery.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierResponse> getAllSuppliers(Boolean active) {
        List<Supplier> suppliers = active != null && active
                ? supplierRepository.findByIsActiveTrue()
                : supplierRepository.findAll();

        return suppliers.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SupplierResponse getSupplierById(Integer id) {
        Supplier supplier = findById(id);
        return toResponse(supplier);
    }

    public SupplierResponse getSupplierByCode(String code) {
        Supplier supplier = supplierRepository.findBySupplierCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "code", code));
        return toResponse(supplier);
    }

    public List<SupplierResponse> searchSuppliers(String query, Boolean active) {
        // If query is null or empty, use getAllSuppliers instead
        if (query == null || query.trim().isEmpty()) {
            return getAllSuppliers(active);
        }

        return supplierRepository.searchSuppliers(query, active)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SupplierResponse createSupplier(SupplierRequest request, Integer createdBy) {
        // Check uniqueness
        if (supplierRepository.existsBySupplierCode(request.getSupplierCode())) {
            throw new BadRequestException("Supplier code already exists");
        }

        Supplier supplier = new Supplier();
        supplier.setSupplierCode(request.getSupplierCode());
        supplier.setSupplierName(request.getSupplierName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setPhone(request.getPhone());
        supplier.setAlternatePhone(request.getAlternatePhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setCreditLimit(request.getCreditLimit());
        supplier.setIsActive(request.getIsActive());
        supplier.setCreatedBy(createdBy);
        supplier.setUpdatedBy(createdBy);

        supplier = supplierRepository.save(supplier);
        return toResponse(supplier);
    }

    public SupplierResponse updateSupplier(Integer id, SupplierRequest request, Integer updatedBy) {
        Supplier supplier = findById(id);

        // Check uniqueness
        Supplier existing = supplierRepository.findBySupplierCode(request.getSupplierCode()).orElse(null);
        if (existing != null && !existing.getSupplierId().equals(id)) {
            throw new BadRequestException("Supplier code already exists");
        }

        supplier.setSupplierCode(request.getSupplierCode());
        supplier.setSupplierName(request.getSupplierName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setPhone(request.getPhone());
        supplier.setAlternatePhone(request.getAlternatePhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setCreditLimit(request.getCreditLimit());
        supplier.setIsActive(request.getIsActive());
        supplier.setUpdatedBy(updatedBy);

        supplier = supplierRepository.save(supplier);
        return toResponse(supplier);
    }

    public void deleteSupplier(Integer id) {
        Supplier supplier = findById(id);
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
    }

    public String generateSupplierCode() {
        String lastCode = supplierRepository.findLastSupplierCode().orElse(null);
        return CodeGenerator.generateSupplierCode(lastCode);
    }

    // Helper methods
    private Supplier findById(Integer id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
    }

    private SupplierResponse toResponse(Supplier supplier) {
        SupplierResponse response = new SupplierResponse();
        response.setSupplierId(supplier.getSupplierId());
        response.setSupplierCode(supplier.getSupplierCode());
        response.setSupplierName(supplier.getSupplierName());
        response.setContactPerson(supplier.getContactPerson());
        response.setPhone(supplier.getPhone());
        response.setAlternatePhone(supplier.getAlternatePhone());
        response.setEmail(supplier.getEmail());
        response.setAddress(supplier.getAddress());
        response.setCity(supplier.getCity());
        response.setPaymentTerms(supplier.getPaymentTerms());
        response.setCreditLimit(supplier.getCreditLimit());
        response.setIsActive(supplier.getIsActive());
        response.setCreatedAt(supplier.getCreatedAt());
        return response;
    }
}
