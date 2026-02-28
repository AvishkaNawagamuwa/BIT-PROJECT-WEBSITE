package com.sampathgrocery.controller.user;

import com.sampathgrocery.dto.user.RoleDTO;
import com.sampathgrocery.service.user.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Role Management
 * Endpoints: /api/roles
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RoleController {

    private final RoleService roleService;

    /**
     * GET /api/roles - Get all roles
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllRoles() {
        try {
            List<RoleDTO> roles = roleService.getAllRoles();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", roles);
            response.put("count", roles.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching all roles", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch roles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * GET /api/roles/active - Get all active roles
     */
    @GetMapping("/active")
    public ResponseEntity<Map<String, Object>> getActiveRoles() {
        try {
            List<RoleDTO> roles = roleService.getActiveRoles();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", roles);
            response.put("count", roles.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching active roles", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch active roles: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * GET /api/roles/{id} - Get role by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRoleById(@PathVariable Integer id) {
        try {
            RoleDTO role = roleService.getRoleById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", role);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error fetching role by ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error fetching role by ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to fetch role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * POST /api/roles - Create new role
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createRole(@Valid @RequestBody RoleDTO roleDTO) {
        try {
            RoleDTO createdRole = roleService.createRole(roleDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Role created successfully");
            response.put("data", createdRole);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Error creating role", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Error creating role", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to create role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * PUT /api/roles/{id} - Update role
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateRole(
            @PathVariable Integer id,
            @Valid @RequestBody RoleDTO roleDTO) {
        try {
            RoleDTO updatedRole = roleService.updateRole(id, roleDTO);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Role updated successfully");
            response.put("data", updatedRole);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error updating role ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Error updating role ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to update role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * DELETE /api/roles/{id} - Soft delete role (set isActive = false)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteRole(@PathVariable Integer id) {
        try {
            roleService.deleteRole(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Role deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting role ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error deleting role ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to delete role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * DELETE /api/roles/{id}/hard - Hard delete role (permanent)
     */
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Map<String, Object>> hardDeleteRole(@PathVariable Integer id) {
        try {
            roleService.hardDeleteRole(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Role permanently deleted");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error hard deleting role ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error hard deleting role ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to permanently delete role: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
