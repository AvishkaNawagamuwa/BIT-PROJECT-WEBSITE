package com.sampathgrocery.util;

import com.sampathgrocery.entity.product.ProductBatch;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Utility class for stock calculations
 * Handles stock quantity calculations and reorder checks
 */
public class StockCalculator {

    /**
     * Calculate total stock across all batches for a product
     */
    public static int calculateTotalStock(List<ProductBatch> batches) {
        if (batches == null || batches.isEmpty()) {
            return 0;
        }

        return batches.stream()
                .filter(b -> b.getIsActive() && b.getStockQuantity() != null)
                .mapToInt(ProductBatch::getStockQuantity)
                .sum();
    }

    /**
     * Check if product needs reordering
     */
    public static boolean needsReorder(int totalStock, int reorderPoint) {
        return totalStock <= reorderPoint;
    }

    /**
     * Calculate days until expiry
     */
    public static long getDaysUntilExpiry(LocalDate expiryDate) {
        if (expiryDate == null) {
            return Long.MAX_VALUE;
        }

        LocalDate today = LocalDate.now();
        return ChronoUnit.DAYS.between(today, expiryDate);
    }

    /**
     * Check if batch is expiring soon (within 30 days)
     */
    public static boolean isExpiringSoon(LocalDate expiryDate) {
        return isExpiringSoon(expiryDate, 30);
    }

    /**
     * Check if batch is expiring soon (custom days)
     */
    public static boolean isExpiringSoon(LocalDate expiryDate, int warningDays) {
        if (expiryDate == null) {
            return false;
        }

        long daysUntilExpiry = getDaysUntilExpiry(expiryDate);
        return daysUntilExpiry >= 0 && daysUntilExpiry <= warningDays;
    }

    /**
     * Check if batch has expired
     */
    public static boolean isExpired(LocalDate expiryDate) {
        if (expiryDate == null) {
            return false;
        }

        return expiryDate.isBefore(LocalDate.now());
    }
}
