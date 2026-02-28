package com.sampathgrocery.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for generating unique codes
 * Handles auto-code generation for Product, Supplier, PO, GRN, Batch
 */
public class CodeGenerator {

    /**
     * Generate next Product Code (PROD-00001, PROD-00002, ...)
     */
    public static String generateProductCode(String lastCode) {
        if (lastCode == null || lastCode.isEmpty()) {
            return "PROD-00001";
        }
        try {
            String prefix = "PROD-";
            String numberPart = lastCode.substring(prefix.length());
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return String.format("%s%05d", prefix, nextNumber);
        } catch (Exception e) {
            return "PROD-00001";
        }
    }

    /**
     * Generate next Supplier Code (SUP-00001, SUP-00002, ...)
     */
    public static String generateSupplierCode(String lastCode) {
        if (lastCode == null || lastCode.isEmpty()) {
            return "SUP-00001";
        }
        try {
            String prefix = "SUP-";
            String numberPart = lastCode.substring(prefix.length());
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return String.format("%s%05d", prefix, nextNumber);
        } catch (Exception e) {
            return "SUP-00001";
        }
    }

    /**
     * Generate next PO Number (PO-00001, PO-00002, ...)
     */
    public static String generatePONumber(String lastCode) {
        if (lastCode == null || lastCode.isEmpty()) {
            return "PO-00001";
        }
        try {
            String prefix = "PO-";
            String numberPart = lastCode.substring(prefix.length());
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return String.format("%s%05d", prefix, nextNumber);
        } catch (Exception e) {
            return "PO-00001";
        }
    }

    /**
     * Generate GRN Number with date (GRN-20260220-0001)
     */
    public static String generateGRNNumber(String lastCode) {
        String today = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "GRN-" + today + "-";

        if (lastCode == null || !lastCode.startsWith("GRN-" + today)) {
            return prefix + "0001";
        }

        try {
            String[] parts = lastCode.split("-");
            if (parts.length >= 3) {
                int nextNumber = Integer.parseInt(parts[2]) + 1;
                return String.format("%s%04d", prefix, nextNumber);
            }
        } catch (Exception e) {
            // Fall through
        }

        return prefix + "0001";
    }

    /**
     * Generate Batch Code (BATCH-00001, BATCH-00002, ...)
     */
    public static String generateBatchCode(String lastCode) {
        if (lastCode == null || lastCode.isEmpty()) {
            return "BATCH-00001";
        }
        try {
            String prefix = "BATCH-";
            String numberPart = lastCode.substring(prefix.length());
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return String.format("%s%05d", prefix, nextNumber);
        } catch (Exception e) {
            return "BATCH-00001";
        }
    }

    /**
     * Generate Barcode (unique timestamp-based)
     */
    public static String generateBarcode() {
        return "BC" + System.currentTimeMillis();
    }

    /**
     * Generate next Customer Code (CUST-00001, CUST-00002, ...)
     */
    public static String generateCustomerCode(String lastCode) {
        if (lastCode == null || lastCode.isEmpty()) {
            return "CUST-00001";
        }
        try {
            String prefix = "CUST-";
            String numberPart = lastCode.substring(prefix.length());
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return String.format("%s%05d", prefix, nextNumber);
        } catch (Exception e) {
            return "CUST-00001";
        }
    }

    /**
     * Generate next Order Code (ORD-00001, ORD-00002, ...)
     */
    public static String generateOrderCode(String lastCode) {
        if (lastCode == null || lastCode.isEmpty()) {
            return "ORD-00001";
        }
        try {
            String prefix = "ORD-";
            String numberPart = lastCode.substring(prefix.length());
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return String.format("%s%05d", prefix, nextNumber);
        } catch (Exception e) {
            return "ORD-00001";
        }
    }

    /**
     * Generate next Invoice Number (INV-00001, INV-00002, ...)
     */
    public static String generateInvoiceNumber(String lastCode) {
        if (lastCode == null || lastCode.isEmpty()) {
            return "INV-00001";
        }
        try {
            String prefix = "INV-";
            String numberPart = lastCode.substring(prefix.length());
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return String.format("%s%05d", prefix, nextNumber);
        } catch (Exception e) {
            return "INV-00001";
        }
    }

    /**
     * Generate Loyalty Card Number (LOY-00001, LOY-00002, ...)
     */
    public static String generateLoyaltyCardNumber(Integer customerId) {
        return String.format("LOY-%05d", customerId);
    }
}
