package com.sampathgrocery.repository.delivery;

import com.sampathgrocery.entity.delivery.DeliveryRouteItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRouteItemRepository extends JpaRepository<DeliveryRouteItem, Integer> {

       @Query("SELECT dri FROM DeliveryRouteItem dri WHERE dri.route.routeId = :routeId " +
                     "ORDER BY dri.stopOrder ASC")
       List<DeliveryRouteItem> findByRouteIdOrderByStopOrder(@Param("routeId") Integer routeId);

       @Query("SELECT dri FROM DeliveryRouteItem dri WHERE dri.route.routeId = :routeId " +
                     "AND dri.delivery.deliveryId = :deliveryId")
       Optional<DeliveryRouteItem> findByRouteIdAndDeliveryId(@Param("routeId") Integer routeId,
                     @Param("deliveryId") Integer deliveryId);

       @Modifying
       @Query("DELETE FROM DeliveryRouteItem dri WHERE dri.route.routeId = :routeId " +
                     "AND dri.delivery.deliveryId = :deliveryId")
       void deleteByRouteIdAndDeliveryId(@Param("routeId") Integer routeId,
                     @Param("deliveryId") Integer deliveryId);

       @Modifying
       @Query("DELETE FROM DeliveryRouteItem dri WHERE dri.route.routeId = :routeId")
       void deleteByRouteId(@Param("routeId") Integer routeId);

       @Query("SELECT COUNT(dri) FROM DeliveryRouteItem dri WHERE dri.route.routeId = :routeId")
       long countByRouteId(@Param("routeId") Integer routeId);
}
