package com.sampathgrocery.repository.order;

import com.sampathgrocery.entity.order.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for CartItem entity
 */
@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Integer> {

    List<CartItem> findByCartCartId(Integer cartId);

    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.cartId = :cartId AND ci.batch.batchId = :batchId")
    Optional<CartItem> findByCartIdAndBatchId(@Param("cartId") Integer cartId, @Param("batchId") Integer batchId);

    void deleteByCartCartId(Integer cartId);
}
