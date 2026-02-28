package com.sampathgrocery.repository.delivery;

import com.sampathgrocery.entity.delivery.DeliveryRoute;
import com.sampathgrocery.entity.delivery.RouteStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface DeliveryRouteRepository extends JpaRepository<DeliveryRoute, Integer> {

    @Query("SELECT dr FROM DeliveryRoute dr WHERE " +
           "(:date IS NULL OR dr.routeDate = :date)")
    Page<DeliveryRoute> searchRoutes(@Param("date") LocalDate date, Pageable pageable);

    Page<DeliveryRoute> findByStatus(RouteStatus status, Pageable pageable);
}
