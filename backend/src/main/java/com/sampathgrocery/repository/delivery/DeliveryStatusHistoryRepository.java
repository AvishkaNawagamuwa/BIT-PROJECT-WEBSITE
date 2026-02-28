package com.sampathgrocery.repository.delivery;

import com.sampathgrocery.entity.delivery.DeliveryStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryStatusHistoryRepository extends JpaRepository<DeliveryStatusHistory, Integer> {

    @Query("SELECT dsh FROM DeliveryStatusHistory dsh WHERE dsh.delivery.deliveryId = :deliveryId " +
           "ORDER BY dsh.createdAt DESC")
    List<DeliveryStatusHistory> findByDeliveryIdOrderByCreatedAtDesc(@Param("deliveryId") Integer deliveryId);
}
