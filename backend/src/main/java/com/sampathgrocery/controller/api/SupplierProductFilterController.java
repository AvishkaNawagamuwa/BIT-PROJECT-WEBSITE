package com.sampathgrocery.controller.api;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.product.ProductResponse;
import com.sampathgrocery.dto.supplier.SupplierProductPriceDTO;
import com.sampathgrocery.dto.supplier.SupplierResponse;
import com.sampathgrocery.service.supplier.SupplierProductFilterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Supplier-Product Filter API Controller
 * Provides endpoints for dynamic supplier/product filtering in Purchase Orders
 */
@RestController
@RequestMapping("/api/supplier-products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SupplierProductFilterController {

    private final SupplierProductFilterService filterService;

    /**
     * Get all suppliers that can supply a specific product
     * Used when product is selected first in PO form
     * 
     * GET /api/supplier-products/products/{productId}/suppliers
     */
    @GetMapping("/products/{productId}/suppliers")
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getSuppliersByProduct(
            @PathVariable Integer productId) {
        List<SupplierResponse> suppliers = filterService.getSuppliersByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(suppliers));
    }

    /**
     * Get all products that a specific supplier can supply
     * Used when supplier is selected first in PO form
     * 
     * GET /api/supplier-products/suppliers/{supplierId}/products
     */
    @GetMapping("/suppliers/{supplierId}/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProductsBySupplier(
            @PathVariable Integer supplierId) {
        List<ProductResponse> products = filterService.getProductsBySupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    /**
     * Get pricing information for a supplier-product combination
     * Returns default price, last purchase price, and suggested price
     * 
     * GET /api/supplier-products/price?supplierId=1&productId=5
     */
    @GetMapping("/price")
    public ResponseEntity<ApiResponse<SupplierProductPriceDTO>> getPriceInformation(
            @RequestParam Integer supplierId,
            @RequestParam Integer productId) {
        SupplierProductPriceDTO priceInfo = filterService.getPriceInformation(supplierId, productId);
        return ResponseEntity.ok(ApiResponse.success(priceInfo));
    }

    /**
     * Check if a supplier can supply a specific product
     * 
     * GET /api/supplier-products/can-supply?supplierId=1&productId=5
     */
    @GetMapping("/can-supply")
    public ResponseEntity<ApiResponse<Boolean>> canSupplierSupplyProduct(
            @RequestParam Integer supplierId,
            @RequestParam Integer productId) {
        boolean canSupply = filterService.canSupplierSupplyProduct(supplierId, productId);
        return ResponseEntity.ok(ApiResponse.success(canSupply));
    }

    /**
     * Get count of suppliers for a product
     * 
     * GET /api/supplier-products/products/{productId}/supplier-count
     */
    @GetMapping("/products/{productId}/supplier-count")
    public ResponseEntity<ApiResponse<Long>> getSupplierCountForProduct(@PathVariable Integer productId) {
        Long count = filterService.getSupplierCountForProduct(productId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * Get count of products for a supplier
     * 
     * GET /api/supplier-products/suppliers/{supplierId}/product-count
     */
    @GetMapping("/suppliers/{supplierId}/product-count")
    public ResponseEntity<ApiResponse<Long>> getProductCountForSupplier(@PathVariable Integer supplierId) {
        Long count = filterService.getProductCountForSupplier(supplierId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }
}
