package com.sampathgrocery.service.user;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sampathgrocery.dto.user.RoleDTO;
import com.sampathgrocery.entity.user.Role;
import com.sampathgrocery.repository.user.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Role Management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RoleService {

    private final RoleRepository roleRepository;
    private final ObjectMapper objectMapper;

    /**
     * Get all roles
     */
    public List<RoleDTO> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all active roles
     */
    public List<RoleDTO> getActiveRoles() {
        List<Role> roles = roleRepository.findByIsActiveTrue();
        return roles.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get role by ID
     */
    public RoleDTO getRoleById(Integer id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));
        return convertToDTO(role);
    }

    /**
     * Get role by name
     */
    public RoleDTO getRoleByName(String roleName) {
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        return convertToDTO(role);
    }

    /**
     * Create new role
     */
    @Transactional
    public RoleDTO createRole(RoleDTO roleDTO) {
        // Check if role already exists
        if (roleRepository.existsByRoleName(roleDTO.getRoleName())) {
            throw new RuntimeException("Role already exists: " + roleDTO.getRoleName());
        }

        Role role = new Role();
        role.setRoleName(roleDTO.getRoleName());
        role.setDescription(roleDTO.getDescription());
        role.setPermissions(convertPermissionsToJson(roleDTO.getPermissions()));
        role.setIsActive(roleDTO.getIsActive() != null ? roleDTO.getIsActive() : true);

        Role savedRole = roleRepository.save(role);
        log.info("Created new role: {}", savedRole.getRoleName());

        return convertToDTO(savedRole);
    }

    /**
     * Update existing role
     */
    @Transactional
    public RoleDTO updateRole(Integer id, RoleDTO roleDTO) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));

        // Check if name is being changed and if new name already exists
        if (!role.getRoleName().equals(roleDTO.getRoleName())) {
            if (roleRepository.existsByRoleName(roleDTO.getRoleName())) {
                throw new RuntimeException("Role name already exists: " + roleDTO.getRoleName());
            }
            role.setRoleName(roleDTO.getRoleName());
        }

        role.setDescription(roleDTO.getDescription());
        role.setPermissions(convertPermissionsToJson(roleDTO.getPermissions()));

        if (roleDTO.getIsActive() != null) {
            role.setIsActive(roleDTO.getIsActive());
        }

        Role updatedRole = roleRepository.save(role);
        log.info("Updated role: {}", updatedRole.getRoleName());

        return convertToDTO(updatedRole);
    }

    /**
     * Delete role (soft delete by setting isActive = false)
     */
    @Transactional
    public void deleteRole(Integer id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));

        // Soft delete
        role.setIsActive(false);
        roleRepository.save(role);

        log.info("Deleted role: {}", role.getRoleName());
    }

    /**
     * Hard delete role (permanent deletion)
     */
    @Transactional
    public void hardDeleteRole(Integer id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with ID: " + id));

        roleRepository.delete(role);
        log.info("Hard deleted role: {}", role.getRoleName());
    }

    /**
     * Convert Role entity to DTO
     */
    private RoleDTO convertToDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setRoleId(role.getRoleId());
        dto.setRoleName(role.getRoleName());
        dto.setDescription(role.getDescription());
        dto.setPermissions(convertJsonToPermissions(role.getPermissions()));
        dto.setIsActive(role.getIsActive());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setUpdatedAt(role.getUpdatedAt());
        dto.setUserCount(0); // TODO: Implement user count from User table
        return dto;
    }

    /**
     * Convert permissions list to JSON string
     */
    private String convertPermissionsToJson(List<String> permissions) {
        try {
            return objectMapper.writeValueAsString(permissions);
        } catch (JsonProcessingException e) {
            log.error("Error converting permissions to JSON", e);
            throw new RuntimeException("Failed to convert permissions to JSON", e);
        }
    }

    /**
     * Convert JSON string to permissions list
     */
    private List<String> convertJsonToPermissions(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {
            });
        } catch (JsonProcessingException e) {
            log.error("Error parsing permissions JSON", e);
            throw new RuntimeException("Failed to parse permissions JSON", e);
        }
    }
}
