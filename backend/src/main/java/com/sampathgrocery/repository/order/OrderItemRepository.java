package com.sampathgrocery.repository.order;

import com.sampathgrocery.entity.order.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for OrderItem entity
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    List<OrderItem> findByOrderOrderId(Integer orderId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.batch.batchId = :batchId")
    List<OrderItem> findByBatchId(@Param("batchId") Integer batchId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.orderId = :orderId " +
            "AND oi.batch.product.productId = :productId")
    List<OrderItem> findByOrderIdAndProductId(@Param("orderId") Integer orderId,
            @Param("productId") Integer productId);
}
