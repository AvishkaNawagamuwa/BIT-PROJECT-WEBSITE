package com.sampathgrocery.controller.test;

import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Test Controller for debugging - REMOVE IN PRODUCTION
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final BCryptPasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    /**
     * Generate BCrypt hash for a password
     */
    
    @GetMapping("/generate-hash")
    public Map<String, String> generateHash(@RequestParam String password) {
        String hash = passwordEncoder.encode(password);
        log.info("Generated hash for password: {}", password);

        Map<String, String> response = new HashMap<>();
        response.put("password", password);
        response.put("hash", hash);
        response.put("verified", String.valueOf(passwordEncoder.matches(password, hash)));

        return response;
    }

    /**
     * Verify if a password matches a hash
     */
    @GetMapping("/verify-password")
    public Map<String, Object> verifyPassword(
            @RequestParam String password,
            @RequestParam String hash) {

        boolean matches = passwordEncoder.matches(password, hash);
        log.info("Password verification: {} -> {}", password, matches);

        Map<String, Object> response = new HashMap<>();
        response.put("password", password);
        response.put("hash", hash);
        response.put("matches", matches);

        return response;
    }

    /**
     * Fix admin password - Reset to Admin@123
     * WARNING: Only for development! Remove in production!
     */
    @PostMapping("/fix-admin-password")
    @Transactional
    public Map<String, Object> fixAdminPassword() {
        try {
            String newPassword = "Admin@123";
            String newHash = passwordEncoder.encode(newPassword);

            Optional<User> adminUser = userRepository.findByUsername("admin");

            if (adminUser.isPresent()) {
                User user = adminUser.get();
                String oldHash = user.getPassword();
                user.setPassword(newHash);
                userRepository.save(user);

                // Verify the new hash works
                boolean verified = passwordEncoder.matches(newPassword, newHash);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Admin password updated successfully");
                response.put("username", "admin");
                response.put("newPassword", newPassword);
                response.put("oldHash", oldHash);
                response.put("newHash", newHash);
                response.put("verified", verified);

                log.info("Admin password reset successfully. Hash verified: {}", verified);
                return response;
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Admin user not found in database");
                return response;
            }
        } catch (Exception e) {
            log.error("Error fixing admin password", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
            return response;
        }
    }
}
