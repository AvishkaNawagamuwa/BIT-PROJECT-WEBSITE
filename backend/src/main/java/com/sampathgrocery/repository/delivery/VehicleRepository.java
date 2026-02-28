package com.sampathgrocery.repository.delivery;

import com.sampathgrocery.entity.delivery.Vehicle;
import com.sampathgrocery.entity.delivery.VehicleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    Optional<Vehicle> findByVehicleCode(String vehicleCode);

    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);

    List<Vehicle> findByIsActiveTrue();

    Page<Vehicle> findByIsActiveTrueAndVehicleType(VehicleType vehicleType, Pageable pageable);

    @Query("SELECT v FROM Vehicle v WHERE v.isActive = true " +
           "AND (:type IS NULL OR v.vehicleType = :type)")
    Page<Vehicle> searchVehicles(@Param("type") VehicleType type, Pageable pageable);

    @Query("SELECT MAX(v.vehicleCode) FROM Vehicle v WHERE v.vehicleCode LIKE 'VEH-%'")
    String findLatestVehicleCode();
}
