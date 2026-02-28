package com.sampathgrocery.dto.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for Role entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {

    @JsonProperty("id")
    private Integer roleId;

    @NotBlank(message = "Role name is required")
    @JsonProperty("name")
    private String roleName;

    @NotEmpty(message = "At least one permission is required")
    @JsonProperty("permissions")
    private List<String> permissions;

    @JsonProperty("description")
    private String description;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @JsonProperty("userCount")
    private Integer userCount; // Number of users assigned to this role
}
