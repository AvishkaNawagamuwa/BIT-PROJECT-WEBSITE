package com.sampathgrocery.repository.customer;

import com.sampathgrocery.entity.customer.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for CustomerProfile entity
 */
@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, Integer> {

    Optional<CustomerProfile> findByCustomerCustomerId(Integer customerId);

    boolean existsByCustomerCustomerId(Integer customerId);

    void deleteByCustomerCustomerId(Integer customerId);
}
