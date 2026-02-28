package com.sampathgrocery.repository.order;

import com.sampathgrocery.entity.order.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Cart entity
 */
@Repository
public interface CartRepository extends JpaRepository<Cart, Integer> {

    Optional<Cart> findByUserUserId(Integer userId);

    Optional<Cart> findBySessionId(String sessionId);

    @Query("SELECT c FROM Cart c WHERE c.user.userId = :userId OR c.sessionId = :sessionId")
    Optional<Cart> findByUserIdOrSessionId(@Param("userId") Integer userId, @Param("sessionId") String sessionId);

    @Query("SELECT c FROM Cart c WHERE c.expiresAt < :currentTime")
    List<Cart> findExpiredCarts(@Param("currentTime") LocalDateTime currentTime);

    @Modifying
    @Query("DELETE FROM Cart c WHERE c.expiresAt < :currentTime")
    void deleteExpiredCarts(@Param("currentTime") LocalDateTime currentTime);
}
