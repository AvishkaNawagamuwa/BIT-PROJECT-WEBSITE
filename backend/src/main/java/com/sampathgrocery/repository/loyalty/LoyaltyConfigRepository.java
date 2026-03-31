package com.sampathgrocery.repository.loyalty;

import com.sampathgrocery.entity.loyalty.LoyaltyConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Loyalty Configuration
 */
@Repository
public interface LoyaltyConfigRepository extends JpaRepository<LoyaltyConfig, Long> {
    Optional<LoyaltyConfig> findByIsActiveTrue();

    Optional<LoyaltyConfig> findFirstByOrderByUpdatedAtDesc();
}
