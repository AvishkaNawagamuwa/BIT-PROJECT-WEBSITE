package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.product.BrandRequest;
import com.sampathgrocery.dto.product.BrandResponse;
import com.sampathgrocery.service.product.BrandService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Brand API Controller
 */
@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;

    /**
     * Get all brands
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAllBrands() {
        List<BrandResponse> brands = brandService.getAllBrands();
        return ResponseEntity.ok(ApiResponse.success(brands));
    }

    /**
     * Get all active brands
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAllActiveBrands() {
        List<BrandResponse> brands = brandService.getAllActiveBrands();
        return ResponseEntity.ok(ApiResponse.success(brands));
    }

    /**
     * Get brand by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable Integer id) {
        BrandResponse brand = brandService.getBrandById(id);
        return ResponseEntity.ok(ApiResponse.success(brand));
    }

    /**
     * Create new brand
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(
            @Valid @RequestBody BrandRequest request,
            @RequestParam(required = false, defaultValue = "1") Integer createdBy) {
        BrandResponse brand = brandService.createBrand(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Brand created successfully", brand));
    }

    /**
     * Update brand
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable Integer id,
            @Valid @RequestBody BrandRequest request,
            @RequestParam(required = false, defaultValue = "1") Integer updatedBy) {
        BrandResponse brand = brandService.updateBrand(id, request, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Brand updated successfully", brand));
    }

    /**
     * Delete brand
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable Integer id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully", null));
    }

    /**
     * Toggle brand status
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<BrandResponse>> toggleStatus(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "1") Integer updatedBy) {
        BrandResponse brand = brandService.toggleBrandStatus(id, updatedBy);
        return ResponseEntity.ok(ApiResponse.success("Brand status updated successfully", brand));
    }
}
