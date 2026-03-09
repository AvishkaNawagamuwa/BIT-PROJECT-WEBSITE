package com.sampathgrocery.service.supplier;

import com.sampathgrocery.dto.product.ProductResponse;
import com.sampathgrocery.dto.supplier.SupplierProductPriceDTO;
import com.sampathgrocery.dto.supplier.SupplierResponse;
import com.sampathgrocery.entity.supplier.SupplierProduct;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.supplier.PurchaseOrderItemRepository;
import com.sampathgrocery.repository.supplier.SupplierProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Supplier-Product Filtering Service
 * Handles dynamic filtering of suppliers/products for Purchase Orders
 * and price lookup based on supplier-product combinations
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierProductFilterService {

    private final SupplierProductRepository supplierProductRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;

    /**
     * Get all suppliers that can supply a specific product
     * Used when product is selected first in PO form
     */
    public List<SupplierResponse> getSuppliersByProduct(Integer productId) {
        List<SupplierProduct> supplierProducts = supplierProductRepository.findByProductIdAndActive(productId);

        return supplierProducts.stream()
                .map(sp -> {
                    SupplierResponse response = new SupplierResponse();
                    response.setSupplierId(sp.getSupplier().getSupplierId());
                    response.setSupplierCode(sp.getSupplier().getSupplierCode());
                    response.setSupplierName(sp.getSupplier().getSupplierName());
                    response.setContactPerson(sp.getSupplier().getContactPerson());
                    response.setPhone(sp.getSupplier().getPhone());
                    response.setEmail(sp.getSupplier().getEmail());
                    response.setIsActive(sp.getSupplier().getIsActive());
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get all products that a specific supplier can supply
     * Used when supplier is selected first in PO form
     */
    public List<ProductResponse> getProductsBySupplier(Integer supplierId) {
        List<SupplierProduct> supplierProducts = supplierProductRepository.findBySupplierIdAndActive(supplierId);

        return supplierProducts.stream()
                .map(sp -> {
                    ProductResponse response = new ProductResponse();
                    response.setProductId(sp.getProduct().getProductId());
                    response.setProductCode(sp.getProduct().getProductCode());
                    response.setProductName(sp.getProduct().getProductName());
                    response.setCategoryId(
                            sp.getProduct().getCategory() != null ? sp.getProduct().getCategory().getCategoryId()
                                    : null);
                    response.setCategoryName(
                            sp.getProduct().getCategory() != null ? sp.getProduct().getCategory().getCategoryName()
                                    : null);
                    response.setBarcode(sp.getProduct().getBarcode());
                    response.setBrandId(sp.getProduct().getBrand() != null ? sp.getProduct().getBrand().getBrandId() : null);
                    response.setBrandName(sp.getProduct().getBrand() != null ? sp.getProduct().getBrand().getBrandName() : null);
                    response.setUnitId(sp.getProduct().getUnit() != null ? sp.getProduct().getUnit().getUnitId() : null);
                    response.setUnitCode(sp.getProduct().getUnit() != null ? sp.getProduct().getUnit().getUnitCode() : null);
                    response.setUnitName(sp.getProduct().getUnit() != null ? sp.getProduct().getUnit().getUnitName() : null);
                    response.setIsActive(sp.getProduct().getIsActive());
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Get pricing information for a supplier-product combination
     * Returns default price, last purchase price, and suggested price
     */
    public SupplierProductPriceDTO getPriceInformation(Integer supplierId, Integer productId) {
        // Find supplier-product relationship
        SupplierProduct sp = supplierProductRepository.findBySupplierIdAndProductId(supplierId, productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Supplier-Product relationship not found for supplierId: " + supplierId +
                                " and productId: " + productId));

        SupplierProductPriceDTO priceInfo = new SupplierProductPriceDTO();

        // Basic info
        priceInfo.setSupplierId(sp.getSupplier().getSupplierId());
        priceInfo.setSupplierName(sp.getSupplier().getSupplierName());
        priceInfo.setProductId(sp.getProduct().getProductId());
        priceInfo.setProductCode(sp.getProduct().getProductCode());
        priceInfo.setProductName(sp.getProduct().getProductName());

        // Default purchase price from supplier_products table
        priceInfo.setDefaultPurchasePrice(sp.getPurchasePrice());

        // Get last purchase price from PO history
        BigDecimal lastPrice = purchaseOrderItemRepository
                .findLastPurchasePrice(supplierId, productId)
                .orElse(null);
        priceInfo.setLastPurchasePrice(lastPrice);

        // Determine suggested price (priority: last PO price > default price)
        BigDecimal suggestedPrice = lastPrice != null ? lastPrice : sp.getPurchasePrice();
        priceInfo.setSuggestedUnitPrice(suggestedPrice);

        // Additional details
        priceInfo.setLeadTimeDays(sp.getLeadTimeDays());
        priceInfo.setMinimumOrderQty(sp.getMinimumOrderQty());
        priceInfo.setIsPrimarySupplier(sp.getIsPrimarySupplier());

        return priceInfo;
    }

    /**
     * Check if a supplier can supply a specific product
     */
    public boolean canSupplierSupplyProduct(Integer supplierId, Integer productId) {
        return supplierProductRepository.findBySupplierIdAndProductId(supplierId, productId).isPresent();
    }

    /**
     * Get count of suppliers for a product
     */
    public Long getSupplierCountForProduct(Integer productId) {
        return supplierProductRepository.countSuppliersByProduct(productId);
    }

    /**
     * Get count of products for a supplier
     */
    public Long getProductCountForSupplier(Integer supplierId) {
        return supplierProductRepository.countProductsBySupplier(supplierId);
    }
}
