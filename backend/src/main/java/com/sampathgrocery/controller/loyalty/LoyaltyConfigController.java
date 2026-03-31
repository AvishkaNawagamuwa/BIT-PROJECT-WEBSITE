package com.sampathgrocery.controller.loyalty;

import com.sampathgrocery.dto.loyalty.LoyaltyConfigRequest;
import com.sampathgrocery.dto.loyalty.LoyaltyConfigResponse;
import com.sampathgrocery.service.loyalty.LoyaltyConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Loyalty Configuration
 */
@RestController
@RequestMapping("/api/loyalty")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class LoyaltyConfigController {

    @Autowired
    private LoyaltyConfigService loyaltyConfigService;

    /**
     * GET /api/loyalty/config - Get current loyalty configuration
     */
    @GetMapping("/config")
    public ResponseEntity<LoyaltyConfigResponse> getConfig() {
        try {
            LoyaltyConfigResponse config = loyaltyConfigService.getCurrentConfig();
            log.info("Fetched loyalty configuration");
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            log.error("Error fetching loyalty configuration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/loyalty/config - Update loyalty configuration
     */
    @PostMapping("/config")
    public ResponseEntity<LoyaltyConfigResponse> updateConfig(@RequestBody LoyaltyConfigRequest request) {
        try {
            log.info("Updating loyalty configuration: earnRate={}, minPurchase={}",
                    request.getEarnRate(), request.getMinPurchaseAmount());

            // Validate request
            if (request.getEarnRate() != null && request.getEarnRate().signum() < 0) {
                return ResponseEntity.badRequest().build();
            }
            if (request.getPointValue() != null && request.getPointValue().signum() <= 0) {
                return ResponseEntity.badRequest().build();
            }

            LoyaltyConfigResponse response = loyaltyConfigService.updateConfig(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating loyalty configuration", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/loyalty/calculate-points - Calculate points for amount
     */
    @GetMapping("/calculate-points")
    public ResponseEntity<Integer> calculatePoints(@RequestParam("amount") String amount) {
        try {
            java.math.BigDecimal transactionAmount = new java.math.BigDecimal(amount);
            Integer points = loyaltyConfigService.calculateLoyaltyPoints(transactionAmount);
            return ResponseEntity.ok(points);
        } catch (Exception e) {
            log.error("Error calculating loyalty points", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
