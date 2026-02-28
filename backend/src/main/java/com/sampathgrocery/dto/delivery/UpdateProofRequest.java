package com.sampathgrocery.dto.delivery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProofRequest {

    @NotBlank(message = "Proof of delivery URL is required")
    @Size(max = 500, message = "URL cannot exceed 500 characters")
    private String proofOfDeliveryUrl;
}
