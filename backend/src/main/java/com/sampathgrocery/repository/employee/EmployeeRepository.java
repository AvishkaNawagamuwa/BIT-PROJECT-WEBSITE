package com.sampathgrocery.repository.employee;

import com.sampathgrocery.entity.employee.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Optional<Employee> findByUserUserId(Integer userId);

    Optional<Employee> findByNic(String nic);

    List<Employee> findByIsActiveTrue();

    List<Employee> findByDesignation(String designation);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByNic(String nic);

    @Query("SELECT e FROM Employee e WHERE e.isActive = true " +
            "AND (LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(e.phone) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(e.employeeCode) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Employee> searchEmployees(@Param("search") String search);

    @Query("SELECT MAX(e.employeeCode) FROM Employee e WHERE e.employeeCode LIKE 'EMP-%'")
    String findLatestEmployeeCode();
}
