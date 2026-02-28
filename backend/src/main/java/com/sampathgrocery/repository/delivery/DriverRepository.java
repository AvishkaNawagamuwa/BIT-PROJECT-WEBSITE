package com.sampathgrocery.repository.delivery;

import com.sampathgrocery.entity.delivery.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends JpaRepository<Driver, Integer> {

    Optional<Driver> findByDriverCode(String driverCode);

    Optional<Driver> findByLicenseNumber(String licenseNumber);

    List<Driver> findByIsActive(Boolean isActive);

    @Query("SELECT d FROM Driver d WHERE d.isActive = true ORDER BY d.fullName")
    List<Driver> findAllActiveDrivers();

    @Query("SELECT d FROM Driver d WHERE d.employee.employeeId = :employeeId")
    Optional<Driver> findByEmployeeId(Integer employeeId);

    @Query("SELECT d FROM Driver d WHERE d.user.userId = :userId")
    Optional<Driver> findByUserId(Integer userId);

    boolean existsByDriverCode(String driverCode);

    boolean existsByLicenseNumber(String licenseNumber);
}
