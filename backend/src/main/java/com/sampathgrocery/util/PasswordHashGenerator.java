package com.sampathgrocery.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility to generate BCrypt password hashes
 * Run this main method to generate a hash for a password
 */
public class PasswordHashGenerator {

    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String password = "Admin@123";
        String hash = encoder.encode(password);

        System.out.println("========================================");
        System.out.println("Password Hash Generator");
        System.out.println("========================================");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("========================================");
        System.out.println("\nVerification Test:");
        System.out.println("Hash matches password: " + encoder.matches(password, hash));
        System.out.println("\nSQL Update Statement:");
        System.out.println("UPDATE User SET password = '" + hash + "' WHERE username = 'admin';");
        System.out.println("========================================");
    }
}
