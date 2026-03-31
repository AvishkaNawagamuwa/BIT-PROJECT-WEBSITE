package com.sampathgrocery.service.loyalty;

import com.sampathgrocery.dto.loyalty.LoyaltyConfigRequest;
import com.sampathgrocery.dto.loyalty.LoyaltyConfigResponse;
import com.sampathgrocery.entity.loyalty.LoyaltyConfig;
import com.sampathgrocery.repository.loyalty.LoyaltyConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Service for Loyalty Configuration Management
 */
@Service
@Slf4j
@Transactional
public class LoyaltyConfigService {

    @Autowired
    private LoyaltyConfigRepository loyaltyConfigRepository;

    /**
     * Get current active loyalty configuration
     */
    public LoyaltyConfigResponse getCurrentConfig() {
        Optional<LoyaltyConfig> config = loyaltyConfigRepository.findByIsActiveTrue();
        if (config.isEmpty()) {
            // Return default if not found
            config = loyaltyConfigRepository.findFirstByOrderByUpdatedAtDesc();
        }
        return config.map(this::mapToResponse).orElse(getDefaultConfig());
    }

    /**
     * Update loyalty configuration
     */
    public LoyaltyConfigResponse updateConfig(LoyaltyConfigRequest request) {
        LoyaltyConfig config = loyaltyConfigRepository.findByIsActiveTrue()
                .orElseGet(() -> {
                    LoyaltyConfig newConfig = new LoyaltyConfig();
                    newConfig.setIsActive(true);
                    return newConfig;
                });

        // Update fields
        if (request.getIsEnabled() != null) {
            config.setIsEnabled(request.getIsEnabled());
        }
        if (request.getEarnRate() != null) {
            config.setEarnRate(request.getEarnRate());
        }
        if (request.getMinPurchaseAmount() != null) {
            config.setMinPurchaseAmount(request.getMinPurchaseAmount());
        }
        if (request.getMaxPointsPerTransaction() != null) {
            config.setMaxPointsPerTransaction(request.getMaxPointsPerTransaction());
        }
        if (request.getPointValue() != null) {
            config.setPointValue(request.getPointValue());
        }
        if (request.getMinRedeemPoints() != null) {
            config.setMinRedeemPoints(request.getMinRedeemPoints());
        }
        if (request.getTierConfig() != null) {
            config.setTierConfig(request.getTierConfig());
        }

        LoyaltyConfig saved = loyaltyConfigRepository.save(config);
        log.info("Loyalty configuration updated: earnRate={}, minPurchase={}",
                saved.getEarnRate(), saved.getMinPurchaseAmount());

        return mapToResponse(saved);
    }

    /**
     * Calculate loyalty points for a transaction
     */
    public Integer calculateLoyaltyPoints(BigDecimal transactionAmount) {
        LoyaltyConfig config = loyaltyConfigRepository.findByIsActiveTrue()
                .orElseGet(() -> loyaltyConfigRepository.findFirstByOrderByUpdatedAtDesc()
                        .orElse(new LoyaltyConfig()));

        return config.calculatePoints(transactionAmount);
    }

    /**
     * Get default loyalty configuration
     */
    private LoyaltyConfigResponse getDefaultConfig() {
        LoyaltyConfig defaultConfig = new LoyaltyConfig();
        return mapToResponse(defaultConfig);
    }

    /**
     * Map entity to DTO
     */
    private LoyaltyConfigResponse mapToResponse(LoyaltyConfig config) {
        LoyaltyConfigResponse response = new LoyaltyConfigResponse();
        response.setId(config.getId());
        response.setIsEnabled(config.getIsEnabled());
        response.setEarnRate(config.getEarnRate());
        response.setMinPurchaseAmount(config.getMinPurchaseAmount());
        response.setMaxPointsPerTransaction(config.getMaxPointsPerTransaction());
        response.setPointValue(config.getPointValue());
        response.setMinRedeemPoints(config.getMinRedeemPoints());
        response.setTierConfig(config.getTierConfig());
        response.setIsActive(config.getIsActive());
        return response;
    }
}
