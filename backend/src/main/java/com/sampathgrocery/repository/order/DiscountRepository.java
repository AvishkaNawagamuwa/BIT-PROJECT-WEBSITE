package com.sampathgrocery.repository.order;

import com.sampathgrocery.entity.order.Discount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Discount entity
 */
@Repository
public interface DiscountRepository extends JpaRepository<Discount, Integer> {

    Optional<Discount> findByDiscountCode(String discountCode);

    List<Discount> findByIsActiveTrue();

    @Query("SELECT d FROM Discount d WHERE d.isActive = true " +
            "AND d.startDate <= :currentDate AND d.endDate >= :currentDate")
    List<Discount> findActiveDiscounts(@Param("currentDate") LocalDate currentDate);

    @Query("SELECT d FROM Discount d WHERE d.discountCode = :code " +
            "AND d.isActive = true " +
            "AND d.startDate <= :currentDate AND d.endDate >= :currentDate")
    Optional<Discount> findValidDiscountByCode(@Param("code") String code,
            @Param("currentDate") LocalDate currentDate);

    boolean existsByDiscountCode(String discountCode);
}
