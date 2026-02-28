package com.sampathgrocery.service.auth;

import com.sampathgrocery.dto.auth.LoginRequest;
import com.sampathgrocery.dto.auth.LoginResponse;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for handling authentication logic
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    /**
     * Authenticate user with username and password
     */
    public LoginResponse login(LoginRequest request) {
        try {
            // Find user by username
            Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

            if (userOptional.isEmpty()) {
                log.warn("Login attempt failed: User not found - {}", request.getUsername());
                return LoginResponse.builder()
                        .success(false)
                        .message("Invalid username or password")
                        .build();
            }

            User user = userOptional.get();

            // Check if user is active
            if (!user.getIsActive()) {
                log.warn("Login attempt failed: User is inactive - {}", request.getUsername());
                return LoginResponse.builder()
                        .success(false)
                        .message("Your account has been deactivated. Please contact administrator.")
                        .build();
            }

            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                log.warn("Login attempt failed: Invalid password for user - {}", request.getUsername());
                return LoginResponse.builder()
                        .success(false)
                        .message("Invalid username or password")
                        .build();
            }

            // Update last login time
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Successful login
            log.info("User logged in successfully: {}", request.getUsername());
            return LoginResponse.builder()
                    .success(true)
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .roleName(user.getRole().getRoleName())
                    .message("Login successful")
                    .build();

        } catch (Exception e) {
            log.error("Error during login process: ", e);
            return LoginResponse.builder()
                    .success(false)
                    .message("An error occurred during login. Please try again.")
                    .build();
        }
    }
}
