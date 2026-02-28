package com.sampathgrocery.util;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Utility class for pricing calculations
 * Handles margin calculations and price adjustments
 */
public class PricingUtil {

    /**
     * Default profit margin percentage (20%)
     */
    public static final BigDecimal DEFAULT_MARGIN_PERCENT = new BigDecimal("20");

    /**
     * Calculate selling price from purchase price with margin
     * 
     * @param purchasePrice Purchase price
     * @param marginPercent Profit margin percentage (e.g., 20 for 20%)
     * @return Selling price
     */
    public static BigDecimal calculateSellingPrice(BigDecimal purchasePrice, BigDecimal marginPercent) {
        if (purchasePrice == null || purchasePrice.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        if (marginPercent == null || marginPercent.compareTo(BigDecimal.ZERO) < 0) {
            marginPercent = DEFAULT_MARGIN_PERCENT;
        }

        // selling price = purchase price + (purchase price * margin / 100)
        BigDecimal marginAmount = purchasePrice.multiply(marginPercent)
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        return purchasePrice.add(marginAmount).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate selling price with default margin (20%)
     */
    public static BigDecimal calculateSellingPrice(BigDecimal purchasePrice) {
        return calculateSellingPrice(purchasePrice, DEFAULT_MARGIN_PERCENT);
    }

    /**
     * Calculate profit amount
     */
    public static BigDecimal calculateProfit(BigDecimal sellingPrice, BigDecimal purchasePrice) {
        if (sellingPrice == null || purchasePrice == null) {
            return BigDecimal.ZERO;
        }
        return sellingPrice.subtract(purchasePrice).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate profit percentage
     */
    public static BigDecimal calculateProfitPercent(BigDecimal sellingPrice, BigDecimal purchasePrice) {
        if (purchasePrice == null || purchasePrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal profit = calculateProfit(sellingPrice, purchasePrice);
        return profit.divide(purchasePrice, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
