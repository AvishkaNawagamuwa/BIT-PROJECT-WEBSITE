package com.sampathgrocery.service.employee;

import com.sampathgrocery.dto.employee.EmployeeDTO;
import com.sampathgrocery.dto.user.UserDTO;
import com.sampathgrocery.entity.employee.Employee;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.repository.employee.EmployeeRepository;
import com.sampathgrocery.repository.user.UserRepository;
import com.sampathgrocery.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Employee Management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * Get all employees
     */
    public List<EmployeeDTO> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get active employees
     */
    public List<EmployeeDTO> getActiveEmployees() {
        List<Employee> employees = employeeRepository.findByIsActiveTrue();
        return employees.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get employee by ID
     */
    public EmployeeDTO getEmployeeById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));
        return convertToDTO(employee);
    }

    /**
     * Create new employee
     */
    @Transactional
    public EmployeeDTO createEmployee(EmployeeDTO employeeDTO) {
        Employee employee = new Employee();

        // Auto-generate employee code
        String newEmployeeCode = generateNextEmployeeCode();
        employee.setEmployeeCode(newEmployeeCode);

        updateEmployeeFromDTO(employee, employeeDTO);

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Created employee: {}", savedEmployee.getEmployeeCode());
        return convertToDTO(savedEmployee);
    }

    /**
     * Generate next employee code (e.g., EMP-00001, EMP-00002)
     */
    private String generateNextEmployeeCode() {
        String latestCode = employeeRepository.findLatestEmployeeCode();

        if (latestCode == null || latestCode.isEmpty()) {
            // First employee
            return "EMP-00001";
        }

        try {
            // Extract number from code (e.g., "EMP-00023" -> "00023")
            String numberPart = latestCode.substring(4); // Skip "EMP-"
            int nextNumber = Integer.parseInt(numberPart) + 1;

            // Keep incrementing until we find a unique code
            String newCode;
            do {
                newCode = String.format("EMP-%05d", nextNumber);
                nextNumber++;
            } while (employeeRepository.existsByEmployeeCode(newCode));

            return newCode;
        } catch (Exception e) {
            log.error("Error parsing latest employee code: {}", latestCode, e);
            // Fallback: count all employees and add 1
            long count = employeeRepository.count();
            return String.format("EMP-%05d", count + 1);
        }
    }

    /**
     * Update employee
     */
    @Transactional
    public EmployeeDTO updateEmployee(Integer id, EmployeeDTO employeeDTO) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));

        updateEmployeeFromDTO(employee, employeeDTO);

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Updated employee: {}", savedEmployee.getEmployeeCode());
        return convertToDTO(savedEmployee);
    }

    /**
     * Delete employee (soft delete by setting isActive = false)
     */
    @Transactional
    public void deleteEmployee(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));

        employee.setIsActive(false);
        employeeRepository.save(employee);
        log.info("Deactivated employee: {}", employee.getEmployeeCode());
    }

    /**
     * Hard delete employee
     */
    @Transactional
    public void hardDeleteEmployee(Integer id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found with ID: " + id);
        }
        employeeRepository.deleteById(id);
        log.info("Hard deleted employee with ID: {}", id);
    }

    /**
     * Toggle employee active status
     */
    @Transactional
    public EmployeeDTO toggleEmployeeStatus(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));

        employee.setIsActive(!employee.getIsActive());
        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Toggled employee status: {} - Active: {}", savedEmployee.getEmployeeCode(),
                savedEmployee.getIsActive());
        return convertToDTO(savedEmployee);
    }

    /**
     * Convert Employee entity to DTO
     */
    private EmployeeDTO convertToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setEmployeeId(employee.getEmployeeId());
        dto.setEmployeeCode(employee.getEmployeeCode());
        dto.setFullName(employee.getFullName());
        dto.setNic(employee.getNic());
        dto.setDateOfBirth(employee.getDateOfBirth());
        dto.setGender(employee.getGender() != null ? employee.getGender().name() : null);
        dto.setPhone(employee.getPhone());
        dto.setAlternatePhone(employee.getAlternatePhone());
        dto.setEmail(employee.getEmail());
        dto.setAddress(employee.getAddress());
        dto.setCity(employee.getCity());
        dto.setDesignation(employee.getDesignation());
        dto.setIsActive(employee.getIsActive());
        dto.setCreatedAt(employee.getCreatedAt());
        dto.setUpdatedAt(employee.getUpdatedAt());

        // Set user if linked
        if (employee.getUser() != null) {
            UserDTO userDTO = new UserDTO();
            userDTO.setUserId(employee.getUser().getUserId());
            userDTO.setUsername(employee.getUser().getUsername());
            userDTO.setEmail(employee.getUser().getEmail());
            userDTO.setRoleName(employee.getUser().getRole().getRoleName());
            dto.setUser(userDTO);
        }

        return dto;
    }

    /**
     * Update Employee entity from DTO
     */
    private void updateEmployeeFromDTO(Employee employee, EmployeeDTO dto) {
        // Don't update employee code - it's auto-generated on creation
        employee.setFullName(dto.getFullName());
        employee.setNic(dto.getNic());
        employee.setDateOfBirth(dto.getDateOfBirth());

        if (dto.getGender() != null) {
            employee.setGender(Employee.Gender.valueOf(dto.getGender()));
        }

        employee.setPhone(dto.getPhone());
        employee.setAlternatePhone(dto.getAlternatePhone());
        employee.setEmail(dto.getEmail());
        employee.setAddress(dto.getAddress());
        employee.setCity(dto.getCity());
        employee.setDesignation(dto.getDesignation());
        employee.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
    }

    /**
     * Create login account for employee
     */
    @Transactional
    public EmployeeDTO createLoginAccountForEmployee(Integer employeeId, UserDTO userDTO) {
        // Get employee
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));

        // Check if employee already has a user account
        if (employee.getUser() != null) {
            throw new RuntimeException("Employee already has a login account");
        }

        // Create user account
        UserDTO createdUser = userService.createUser(userDTO);

        // Link user to employee
        User user = userRepository.findById(createdUser.getUserId())
                .orElseThrow(() -> new RuntimeException("Failed to retrieve created user"));
        employee.setUser(user);

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Created login account for employee: {} - Username: {}",
                savedEmployee.getEmployeeCode(), user.getUsername());

        return convertToDTO(savedEmployee);
    }
}
