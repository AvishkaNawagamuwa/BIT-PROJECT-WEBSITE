package com.sampathgrocery.repository.order;

import com.sampathgrocery.entity.order.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for PaymentMethod entity
 */
@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Integer> {

    Optional<PaymentMethod> findByMethodName(String methodName);

    List<PaymentMethod> findByIsActiveTrue();

    boolean existsByMethodName(String methodName);
}
