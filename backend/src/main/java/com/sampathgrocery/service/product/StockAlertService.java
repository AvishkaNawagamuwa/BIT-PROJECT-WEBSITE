package com.sampathgrocery.service.product;

import com.sampathgrocery.dto.product.StockAlertResponse;
import com.sampathgrocery.entity.product.Product;
import com.sampathgrocery.entity.product.ProductBatch;
import com.sampathgrocery.entity.product.StockAlert;
import com.sampathgrocery.entity.product.StockAlert.AlertType;
import com.sampathgrocery.entity.product.StockAlert.Severity;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.product.ProductBatchRepository;
import com.sampathgrocery.repository.product.ProductRepository;
import com.sampathgrocery.repository.product.StockAlertRepository;
import com.sampathgrocery.util.StockCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Stock Alert Service - Automated monitoring and alerts
 */
@Service
@RequiredArgsConstructor
@Transactional
public class StockAlertService {

    private final StockAlertRepository stockAlertRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;

    private static final int EXPIRY_WARNING_DAYS = 30;

    public List<StockAlertResponse> getAllAlerts(AlertType type, Boolean isResolved, Severity severity) {
        List<StockAlert> alerts = stockAlertRepository.searchAlerts(type, isResolved, severity);
        return alerts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<StockAlertResponse> getActiveAlertsByProduct(Integer productId) {
        List<StockAlert> alerts = stockAlertRepository.findByProductProductIdAndIsResolvedFalse(productId);
        return alerts.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public StockAlertResponse resolveAlert(Integer alertId, Integer resolvedBy, String resolutionNotes) {
        StockAlert alert = stockAlertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("StockAlert", "id", alertId));

        alert.setIsResolved(true);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedBy(resolvedBy);
        alert.setResolutionNotes(resolutionNotes);

        alert = stockAlertRepository.save(alert);
        return toResponse(alert);
    }

    /**
     * Check and create/resolve alerts for a specific product
     * Called after stock changes (GRN, sales, adjustments)
     */
    public void checkAndResolveAlertsForProduct(Integer productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        // Calculate current total stock
        Integer totalStock = StockCalculator.calculateTotalStock(
                productBatchRepository.findActiveByProductOrderByExpiryDate(productId));

        // Check for LOW_STOCK and OUT_OF_STOCK
        if (totalStock == 0) {
            // Resolve LOW_STOCK if exists
            resolveExistingAlerts(productId, AlertType.LOW_STOCK);

            // Create or keep OUT_OF_STOCK alert
            createOrUpdateStockAlert(product, AlertType.OUT_OF_STOCK, Severity.CRITICAL,
                    "Product is completely out of stock");
        } else if (StockCalculator.needsReorder(totalStock, product.getReorderPoint())) {
            // Resolve OUT_OF_STOCK if exists
            resolveExistingAlerts(productId, AlertType.OUT_OF_STOCK);

            // Create or keep LOW_STOCK alert
            createOrUpdateStockAlert(product, AlertType.LOW_STOCK, Severity.HIGH,
                    String.format("Stock level (%d) below reorder point (%d)",
                            totalStock, product.getReorderPoint()));
        } else {
            // Stock is sufficient - resolve both alerts
            resolveExistingAlerts(productId, AlertType.LOW_STOCK);
            resolveExistingAlerts(productId, AlertType.OUT_OF_STOCK);
        }

        // Check for expiry-related alerts
        checkExpiryAlerts(product);
    }

    /**
     * Check expiry dates for all batches of a product
     */
    private void checkExpiryAlerts(Product product) {
        List<ProductBatch> batches = productBatchRepository
                .findActiveByProductOrderByExpiryDate(product.getProductId());

        for (ProductBatch batch : batches) {
            if (batch.getExpiryDate() != null) {
                if (StockCalculator.isExpired(batch.getExpiryDate())) {
                    // Create EXPIRED alert
                    createOrUpdateBatchAlert(batch, AlertType.EXPIRED, Severity.CRITICAL,
                            String.format("Batch %s has expired", batch.getBatchCode()));
                } else if (StockCalculator.isExpiringSoon(batch.getExpiryDate(), EXPIRY_WARNING_DAYS)) {
                    // Create NEAR_EXPIRY alert
                    long daysRemaining = StockCalculator.getDaysUntilExpiry(batch.getExpiryDate());
                    Severity severity = daysRemaining < 7 ? Severity.HIGH : Severity.MEDIUM;

                    createOrUpdateBatchAlert(batch, AlertType.NEAR_EXPIRY, severity,
                            String.format("Batch %s expires in %d days", batch.getBatchCode(), daysRemaining));
                } else {
                    // Batch is fine - resolve any expiry alerts
                    resolveExistingBatchAlerts(batch.getBatchId(), AlertType.NEAR_EXPIRY);
                    resolveExistingBatchAlerts(batch.getBatchId(), AlertType.EXPIRED);
                }
            }
        }
    }

    /**
     * Create or update existing alert (avoid duplicates)
     */
    private void createOrUpdateStockAlert(Product product, AlertType type,
            Severity severity, String message) {

        List<StockAlert> existingAlerts = stockAlertRepository
                .findExistingAlert(product.getProductId(), type);

        if (existingAlerts.isEmpty()) {
            StockAlert alert = new StockAlert();
            alert.setProduct(product);
            alert.setAlertType(type);
            alert.setSeverity(severity);
            alert.setAlertMessage(message);
            alert.setIsResolved(false);

            stockAlertRepository.save(alert);
        }
    }

    private void createOrUpdateBatchAlert(ProductBatch batch, AlertType type,
            Severity severity, String message) {

        List<StockAlert> existingAlerts = stockAlertRepository
                .findExistingAlertForBatch(batch.getBatchId(), type);

        if (existingAlerts.isEmpty()) {
            StockAlert alert = new StockAlert();
            alert.setProduct(batch.getProduct());
            alert.setBatch(batch);
            alert.setAlertType(type);
            alert.setSeverity(severity);
            alert.setAlertMessage(message);
            alert.setIsResolved(false);

            stockAlertRepository.save(alert);
        }
    }

    /**
     * Resolve existing unresolved alerts
     */
    private void resolveExistingAlerts(Integer productId, AlertType type) {
        List<StockAlert> alerts = stockAlertRepository
                .findExistingAlert(productId, type);

        for (StockAlert alert : alerts) {
            alert.setIsResolved(true);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolvedBy(0); // System auto-resolved
            alert.setResolutionNotes("Auto-resolved: stock level restored");
            stockAlertRepository.save(alert);
        }
    }

    private void resolveExistingBatchAlerts(Integer batchId, AlertType type) {
        List<StockAlert> alerts = stockAlertRepository
                .findExistingAlertForBatch(batchId, type);

        for (StockAlert alert : alerts) {
            alert.setIsResolved(true);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolvedBy(0);
            alert.setResolutionNotes("Auto-resolved: batch status updated");
            stockAlertRepository.save(alert);
        }
    }

    /**
     * Scheduled job to refresh all alerts (runs every hour)
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void refreshAllAlerts() {
        List<Product> activeProducts = productRepository.findByIsActiveTrue();

        for (Product product : activeProducts) {
            checkAndResolveAlertsForProduct(product.getProductId());
        }
    }

    public long getActiveAlertCount() {
        return stockAlertRepository.countByIsResolvedFalse();
    }

    public long getCriticalAlertCount() {
        return stockAlertRepository.findBySeverityAndIsResolvedFalseOrderByCreatedAtDesc(Severity.CRITICAL).size();
    }

    private StockAlertResponse toResponse(StockAlert alert) {
        StockAlertResponse response = new StockAlertResponse();
        response.setAlertId(alert.getAlertId());
        response.setProductId(alert.getProduct().getProductId());
        response.setProductName(alert.getProduct().getProductName());
        response.setProductCode(alert.getProduct().getProductCode());

        if (alert.getBatch() != null) {
            response.setBatchId(alert.getBatch().getBatchId());
            response.setBatchCode(alert.getBatch().getBatchCode());
        }

        response.setAlertType(alert.getAlertType());
        response.setSeverity(alert.getSeverity());
        response.setAlertMessage(alert.getAlertMessage());
        response.setCreatedAt(alert.getCreatedAt());
        response.setIsResolved(alert.getIsResolved());
        response.setResolvedAt(alert.getResolvedAt());
        response.setResolvedBy(alert.getResolvedBy());
        response.setResolutionNotes(alert.getResolutionNotes());

        return response;
    }
}
