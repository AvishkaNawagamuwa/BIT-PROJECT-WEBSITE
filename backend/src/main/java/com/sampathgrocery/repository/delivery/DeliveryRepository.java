package com.sampathgrocery.repository.delivery;

import com.sampathgrocery.entity.delivery.Delivery;
import com.sampathgrocery.entity.delivery.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Integer> {

    Optional<Delivery> findByDeliveryCode(String deliveryCode);

    @Query("SELECT d FROM Delivery d WHERE " +
           "(:status IS NULL OR d.status = :status) " +
           "AND (:date IS NULL OR d.scheduledDate = :date)")
    Page<Delivery> searchDeliveries(@Param("status") DeliveryStatus status,
                                     @Param("date") LocalDate date,
                                     Pageable pageable);

    @Query("SELECT MAX(d.deliveryCode) FROM Delivery d WHERE d.deliveryCode LIKE 'DEL-%'")
    String findLatestDeliveryCode();
}
