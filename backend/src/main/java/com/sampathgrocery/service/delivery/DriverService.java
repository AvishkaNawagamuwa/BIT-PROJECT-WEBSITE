package com.sampathgrocery.service.delivery;

import com.sampathgrocery.dto.delivery.DriverRequest;
import com.sampathgrocery.dto.delivery.DriverResponse;
import com.sampathgrocery.entity.delivery.Driver;
import com.sampathgrocery.entity.employee.Employee;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.delivery.DriverRepository;
import com.sampathgrocery.repository.employee.EmployeeRepository;
import com.sampathgrocery.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Driver CRUD operations
 */
@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    /**
     * Get all drivers
     */
    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all active drivers
     */
    public List<DriverResponse> getActiveDrivers() {
        return driverRepository.findAllActiveDrivers().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get driver by ID
     */
    public DriverResponse getDriverById(Integer id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
        return convertToResponse(driver);
    }

    /**
     * Get driver by code
     */
    public DriverResponse getDriverByCode(String code) {
        Driver driver = driverRepository.findByDriverCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with code: " + code));
        return convertToResponse(driver);
    }

    /**
     * Create new driver
     */
    @Transactional
    public DriverResponse createDriver(DriverRequest request, Integer createdBy) {
        // Validate unique constraints
        if (driverRepository.existsByDriverCode(request.getDriverCode())) {
            throw new IllegalArgumentException("Driver code already exists: " + request.getDriverCode());
        }
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new IllegalArgumentException("License number already exists: " + request.getLicenseNumber());
        }

        Driver driver = new Driver();
        driver.setDriverCode(request.getDriverCode());
        driver.setFullName(request.getFullName());
        driver.setPhone(request.getPhone());
        driver.setEmail(request.getEmail());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setLicenseExpiryDate(request.getLicenseExpiryDate());
        driver.setLicenseType(request.getLicenseType());
        driver.setAddress(request.getAddress());
        driver.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        driver.setCreatedBy(createdBy);

        // Link to Employee if provided
        if (request.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Employee not found with ID: " + request.getEmployeeId()));
            driver.setEmployee(employee);
        }

        // Link to User if provided
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));
            driver.setUser(user);
        }

        Driver savedDriver = driverRepository.save(driver);
        return convertToResponse(savedDriver);
    }

    /**
     * Update existing driver
     */
    @Transactional
    public DriverResponse updateDriver(Integer id, DriverRequest request, Integer updatedBy) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));

        // Validate unique constraints (excluding current driver)
        if (!driver.getDriverCode().equals(request.getDriverCode()) &&
                driverRepository.existsByDriverCode(request.getDriverCode())) {
            throw new IllegalArgumentException("Driver code already exists: " + request.getDriverCode());
        }
        if (!driver.getLicenseNumber().equals(request.getLicenseNumber()) &&
                driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new IllegalArgumentException("License number already exists: " + request.getLicenseNumber());
        }

        driver.setDriverCode(request.getDriverCode());
        driver.setFullName(request.getFullName());
        driver.setPhone(request.getPhone());
        driver.setEmail(request.getEmail());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setLicenseExpiryDate(request.getLicenseExpiryDate());
        driver.setLicenseType(request.getLicenseType());
        driver.setAddress(request.getAddress());
        driver.setIsActive(request.getIsActive());
        driver.setUpdatedBy(updatedBy);

        // Update Employee link
        if (request.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Employee not found with ID: " + request.getEmployeeId()));
            driver.setEmployee(employee);
        } else {
            driver.setEmployee(null);
        }

        // Update User link
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));
            driver.setUser(user);
        } else {
            driver.setUser(null);
        }

        Driver updatedDriver = driverRepository.save(driver);
        return convertToResponse(updatedDriver);
    }

    /**
     * Delete driver
     */
    @Transactional
    public void deleteDriver(Integer id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
        driverRepository.delete(driver);
    }

    /**
     * Activate/Deactivate driver
     */
    @Transactional
    public DriverResponse toggleDriverStatus(Integer id, Integer updatedBy) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + id));
        driver.setIsActive(!driver.getIsActive());
        driver.setUpdatedBy(updatedBy);
        Driver updatedDriver = driverRepository.save(driver);
        return convertToResponse(updatedDriver);
    }

    /**
     * Convert Driver entity to DriverResponse DTO
     */
    private DriverResponse convertToResponse(Driver driver) {
        DriverResponse response = new DriverResponse();
        response.setDriverId(driver.getDriverId());
        response.setDriverCode(driver.getDriverCode());
        response.setFullName(driver.getFullName());
        response.setPhone(driver.getPhone());
        response.setEmail(driver.getEmail());
        response.setLicenseNumber(driver.getLicenseNumber());
        response.setLicenseExpiryDate(driver.getLicenseExpiryDate());
        response.setLicenseType(driver.getLicenseType());
        response.setAddress(driver.getAddress());
        response.setIsActive(driver.getIsActive());
        response.setCreatedAt(driver.getCreatedAt());
        response.setCreatedBy(driver.getCreatedBy());
        response.setUpdatedAt(driver.getUpdatedAt());
        response.setUpdatedBy(driver.getUpdatedBy());

        // Include User info if linked
        if (driver.getUser() != null) {
            response.setUserId(driver.getUser().getUserId());
            response.setUsername(driver.getUser().getUsername());
        }

        // Include Employee info if linked
        if (driver.getEmployee() != null) {
            response.setEmployeeId(driver.getEmployee().getEmployeeId());
            response.setEmployeeName(driver.getEmployee().getFullName());
        }

        return response;
    }
}
