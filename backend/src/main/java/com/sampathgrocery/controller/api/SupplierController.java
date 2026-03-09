package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.supplier.SupplierProductResponse;
import com.sampathgrocery.dto.supplier.SupplierRequest;
import com.sampathgrocery.dto.supplier.SupplierResponse;
import com.sampathgrocery.service.supplier.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Supplier REST API Controller
 */
@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;
    private static final Integer CURRENT_USER_ID = 1;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getAllSuppliers(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Boolean isActive) {
        List<SupplierResponse> suppliers = supplierService.searchSuppliers(query, isActive);
        return ResponseEntity.ok(ApiResponse.success(suppliers));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> searchSuppliers(
            @RequestParam(required = false) String query) {
        List<SupplierResponse> suppliers = supplierService.searchSuppliers(query, true);
        return ResponseEntity.ok(ApiResponse.success(suppliers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> getSupplierById(@PathVariable Integer id) {
        SupplierResponse supplier = supplierService.getSupplierById(id);
        return ResponseEntity.ok(ApiResponse.success(supplier));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierResponse>> createSupplier(
            @Valid @RequestBody SupplierRequest request) {
        SupplierResponse supplier = supplierService.createSupplier(request, CURRENT_USER_ID);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Supplier created successfully", supplier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> updateSupplier(
            @PathVariable Integer id,
            @Valid @RequestBody SupplierRequest request) {
        SupplierResponse supplier = supplierService.updateSupplier(id, request, CURRENT_USER_ID);
        return ResponseEntity.ok(ApiResponse.success("Supplier updated successfully", supplier));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSupplier(@PathVariable Integer id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier deleted successfully", null));
    }

    @GetMapping("/generate-code")
    public ResponseEntity<ApiResponse<String>> generateSupplierCode() {
        String code = supplierService.generateSupplierCode();
        return ResponseEntity.ok(ApiResponse.success(code));
    }

    // Supplier-Product relationship endpoints
    @GetMapping("/{supplierId}/products")
    public ResponseEntity<ApiResponse<List<SupplierProductResponse>>> getSupplierProducts(
            @PathVariable Integer supplierId) {
        List<SupplierProductResponse> products = supplierService.getSupplierProducts(supplierId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping("/{supplierId}/products")
    public ResponseEntity<ApiResponse<Void>> addProductsToSupplier(
            @PathVariable Integer supplierId,
            @RequestBody List<Integer> productIds) {
        supplierService.addProductsToSupplier(supplierId, productIds, CURRENT_USER_ID);
        return ResponseEntity.ok(ApiResponse.success("Products added to supplier successfully", null));
    }

    @DeleteMapping("/{supplierId}/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeProductFromSupplier(
            @PathVariable Integer supplierId,
            @PathVariable Integer productId) {
        supplierService.removeProductFromSupplier(supplierId, productId);
        return ResponseEntity.ok(ApiResponse.success("Product removed from supplier successfully", null));
    }
}
