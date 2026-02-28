package com.sampathgrocery.repository.order;

import com.sampathgrocery.entity.order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for OrderStatus entity
 */
@Repository
public interface OrderStatusRepository extends JpaRepository<OrderStatus, Integer> {

    Optional<OrderStatus> findByStatusName(String statusName);

    @Query("SELECT os FROM OrderStatus os WHERE os.isActive = true ORDER BY os.displayOrder")
    List<OrderStatus> findAllActiveOrderedByDisplay();

    List<OrderStatus> findByIsActiveTrue();

    boolean existsByStatusName(String statusName);
}
