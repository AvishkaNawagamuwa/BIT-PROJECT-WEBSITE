package com.sampathgrocery.repository.order;

import com.sampathgrocery.entity.order.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Order entity
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByCustomerCustomerId(Integer customerId);

    List<Order> findByStatusStatusId(Integer statusId);

    List<Order> findByOrderType(Order.OrderType orderType);

    @Query("SELECT o FROM Order o WHERE o.customer.customerId = :customerId " +
            "ORDER BY o.createdAt DESC")
    List<Order> findByCustomerOrderByCreatedAtDesc(@Param("customerId") Integer customerId);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :startDate AND :endDate " +
            "ORDER BY o.createdAt DESC")
    List<Order> findByDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT o FROM Order o WHERE o.status.statusId = :statusId " +
            "AND o.orderType = :orderType ORDER BY o.createdAt DESC")
    List<Order> findByStatusAndType(@Param("statusId") Integer statusId,
            @Param("orderType") Order.OrderType orderType);

    @Query("SELECT o FROM Order o WHERE o.createdBy.userId = :userId ORDER BY o.createdAt DESC")
    List<Order> findByCreatedBy(@Param("userId") Integer userId);

    @Query("SELECT MAX(o.orderCode) FROM Order o WHERE o.orderCode LIKE 'ORD-%'")
    String findLatestOrderCode();

    boolean existsByOrderCode(String orderCode);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.customer.customerId = :customerId")
    Long countByCustomerId(@Param("customerId") Integer customerId);
}
