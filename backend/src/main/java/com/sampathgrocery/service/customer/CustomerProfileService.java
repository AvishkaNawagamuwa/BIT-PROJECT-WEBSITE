package com.sampathgrocery.service.customer;

import com.sampathgrocery.dto.customer.CustomerProfileResponse;
import com.sampathgrocery.dto.customer.CustomerProfileUpdateRequest;
import com.sampathgrocery.entity.customer.Customer;
import com.sampathgrocery.entity.customer.CustomerProfile;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.customer.CustomerProfileRepository;
import com.sampathgrocery.repository.customer.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for Customer Profile Management
 * Handles customer profile and preferences
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerProfileService {

    private final CustomerProfileRepository profileRepository;
    private final CustomerRepository customerRepository;

    /**
     * Get customer profile by customer ID
     */
    @Transactional(readOnly = true)
    public CustomerProfileResponse getProfileByCustomerId(Integer customerId) {
        CustomerProfile profile = profileRepository.findByCustomerCustomerId(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for customer ID: " + customerId));
        return mapToResponse(profile);
    }

    /**
     * Update customer profile
     */
    @Transactional
    public CustomerProfileResponse updateProfile(Integer customerId, CustomerProfileUpdateRequest request) {
        log.info("Updating profile for customer ID: {}", customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        CustomerProfile profile = profileRepository.findByCustomerCustomerId(customerId)
                .orElseGet(() -> {
                    CustomerProfile newProfile = new CustomerProfile();
                    newProfile.setCustomer(customer);
                    return newProfile;
                });

        // Update fields if provided
        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            try {
                CustomerProfile.Gender gender = CustomerProfile.Gender.valueOf(request.getGender().toUpperCase());
                profile.setGender(gender);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid gender value: " + request.getGender());
            }
        }
        if (request.getPreferredContactMethod() != null) {
            try {
                CustomerProfile.PreferredContactMethod method = CustomerProfile.PreferredContactMethod
                        .valueOf(request.getPreferredContactMethod().toUpperCase());
                profile.setPreferredContactMethod(method);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid contact method: " + request.getPreferredContactMethod());
            }
        }
        if (request.getPreferences() != null) {
            profile.setPreferences(request.getPreferences());
        }
        if (request.getNotes() != null) {
            profile.setNotes(request.getNotes());
        }

        CustomerProfile updatedProfile = profileRepository.save(profile);
        log.info("Profile updated for customer ID: {}", customerId);
        return mapToResponse(updatedProfile);
    }

    /**
     * Map entity to response DTO
     */
    private CustomerProfileResponse mapToResponse(CustomerProfile profile) {
        CustomerProfileResponse response = new CustomerProfileResponse();
        response.setProfileId(profile.getProfileId());
        response.setCustomerId(profile.getCustomer().getCustomerId());
        response.setDateOfBirth(profile.getDateOfBirth());
        response.setGender(profile.getGender() != null ? profile.getGender().name() : null);
        response.setPreferredContactMethod(
                profile.getPreferredContactMethod() != null ? profile.getPreferredContactMethod().name() : null);
        response.setPreferences(profile.getPreferences());
        response.setNotes(profile.getNotes());
        return response;
    }
}
