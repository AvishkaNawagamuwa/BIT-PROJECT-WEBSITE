package com.sampathgrocery.service.product;

import com.sampathgrocery.dto.product.BrandRequest;
import com.sampathgrocery.dto.product.BrandResponse;
import com.sampathgrocery.entity.product.Brand;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.product.BrandRepository;
import com.sampathgrocery.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Brand Service
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    /**
     * Get all brands
     */
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAllOrderByName().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all active brands
     */
    public List<BrandResponse> getAllActiveBrands() {
        return brandRepository.findAllActive().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get brand by ID
     */
    public BrandResponse getBrandById(Integer id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
        return toResponse(brand);
    }

    /**
     * Create new brand
     */
    public BrandResponse createBrand(BrandRequest request, Integer createdBy) {
        // Check if brand name already exists
        if (brandRepository.existsByBrandName(request.getBrandName())) {
            throw new IllegalArgumentException("Brand name already exists: " + request.getBrandName());
        }

        Brand brand = new Brand();
        brand.setBrandName(request.getBrandName());
        brand.setDescription(request.getDescription());
        brand.setStatus(request.getStatus());
        brand.setCreatedBy(createdBy);
        brand.setUpdatedBy(createdBy);

        brand = brandRepository.save(brand);
        log.info("Created new brand: {}", brand.getBrandName());

        return toResponse(brand);
    }

    /**
     * Update brand
     */
    public BrandResponse updateBrand(Integer id, BrandRequest request, Integer updatedBy) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));

        // Check if brand name already exists (excluding current brand)
        if (brandRepository.existsByBrandNameAndNotBrandId(request.getBrandName(), id)) {
            throw new IllegalArgumentException("Brand name already exists: " + request.getBrandName());
        }

        brand.setBrandName(request.getBrandName());
        brand.setDescription(request.getDescription());
        brand.setStatus(request.getStatus());
        brand.setUpdatedBy(updatedBy);

        brand = brandRepository.save(brand);
        log.info("Updated brand: {}", brand.getBrandName());

        return toResponse(brand);
    }

    /**
     * Delete brand
     */
    public void deleteBrand(Integer id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));

        // Check if brand is used by any products
        Long productCount = productRepository.countByBrandBrandId(id);
        if (productCount > 0) {
            throw new IllegalStateException("Cannot delete brand. It is used by " + productCount + " product(s).");
        }

        brandRepository.delete(brand);
        log.info("Deleted brand: {}", brand.getBrandName());
    }

    /**
     * Toggle brand status
     */
    public BrandResponse toggleBrandStatus(Integer id, Integer updatedBy) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));

        brand.setStatus(brand.getStatus() == Brand.Status.ACTIVE ? Brand.Status.INACTIVE : Brand.Status.ACTIVE);
        brand.setUpdatedBy(updatedBy);

        brand = brandRepository.save(brand);
        log.info("Toggled brand status: {} - {}", brand.getBrandName(), brand.getStatus());

        return toResponse(brand);
    }

    /**
     * Convert entity to response DTO
     */
    private BrandResponse toResponse(Brand brand) {
        BrandResponse response = new BrandResponse();
        response.setBrandId(brand.getBrandId());
        response.setBrandName(brand.getBrandName());
        response.setDescription(brand.getDescription());
        response.setStatus(brand.getStatus());
        response.setCreatedAt(brand.getCreatedAt());

        // Get product count
        Long productCount = productRepository.countByBrandBrandId(brand.getBrandId());
        response.setProductCount(productCount.intValue());

        return response;
    }
}
