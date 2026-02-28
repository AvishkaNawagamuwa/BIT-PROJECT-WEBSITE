package com.sampathgrocery.service.order;

import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.entity.order.Discount;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.exception.*;
import com.sampathgrocery.repository.order.DiscountRepository;
import com.sampathgrocery.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Discount Service - Manages promotional discounts and discount codes
 * Validates discount applicability and calculates discount amounts
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DiscountService {

    private final DiscountRepository discountRepository;
    private final UserRepository userRepository;

    /**
     * Validate a discount code
     */
    @Transactional(readOnly = true)
    public DiscountValidationResponse validateDiscount(DiscountValidationRequest request) {
        log.info("Validating discount code: {}", request.getDiscountCode());

        Discount discount = discountRepository.findValidDiscountByCode(request.getDiscountCode(), LocalDate.now())
                .orElse(null);

        DiscountValidationResponse response = new DiscountValidationResponse();
        response.setDiscountCode(request.getDiscountCode());

        if (discount == null) {
            response.setIsValid(false);
            response.setMessage("Discount code not found or expired");
            return response;
        }

        if (!discount.isValid()) {
            response.setIsValid(false);
            response.setMessage("Discount code is no longer valid");
            return response;
        }

        // Check minimum order amount
        if (request.getPurchaseAmount() != null && discount.getMinPurchaseAmount() != null) {
            if (request.getPurchaseAmount().compareTo(discount.getMinPurchaseAmount()) < 0) {
                response.setIsValid(false);
                response.setMessage(String.format("Minimum order amount is Rs.%.2f", discount.getMinPurchaseAmount()));
                return response;
            }
        }

        // Calculate discount amount
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getPurchaseAmount() != null) {
            discountAmount = discount.calculateDiscountAmount(request.getPurchaseAmount());
        }

        response.setIsValid(true);
        response.setMessage("Discount code is valid");
        response.setDiscountType(discount.getDiscountType().name());
        response.setDiscountValue(discount.getDiscountValue());
        response.setDiscountAmount(discountAmount);
        response.setMaxDiscountAmount(discount.getMaxDiscountAmount());
        response.setMinimumOrderAmount(discount.getMinPurchaseAmount());

        return response;
    }

    /**
     * Get all active discounts
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getActiveDiscounts() {
        return discountRepository.findActiveDiscounts(LocalDate.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get discount by code
     */
    @Transactional(readOnly = true)
    public DiscountResponse getDiscountByCode(String code) {
        Discount discount = discountRepository.findValidDiscountByCode(code, LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("Discount code not found: " + code));
        return mapToResponse(discount);
    }

    /**
     * Get discount by ID
     */
    @Transactional(readOnly = true)
    public DiscountResponse getDiscountById(Integer discountId) {
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with ID: " + discountId));
        return mapToResponse(discount);
    }

    /**
     * Create a new discount
     */
    @Transactional
    public DiscountResponse createDiscount(Discount discount, Integer createdBy) {
        log.info("Creating new discount: {}", discount.getDiscountCode());

        // Validate discount code uniqueness
        if (discountRepository.findByDiscountCode(discount.getDiscountCode()).isPresent()) {
            throw new BusinessRuleViolationException("Discount code already exists: " + discount.getDiscountCode());
        }

        // Validate dates
        if (discount.getEndDate() != null && discount.getStartDate().isAfter(discount.getEndDate())) {
            throw new BadRequestException("Start date must be before end date");
        }

        if (createdBy != null) {
            User creator = userRepository.findById(createdBy).orElse(null);
            discount.setCreatedBy(creator);
        }

        Discount savedDiscount = discountRepository.save(discount);
        log.info("Discount created: {}", savedDiscount.getDiscountCode());

        return mapToResponse(savedDiscount);
    }

    /**
     * Update discount
     */
    @Transactional
    public DiscountResponse updateDiscount(Integer discountId, Discount updateData, Integer updatedBy) {
        log.info("Updating discount ID: {}", discountId);

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with ID: " + discountId));

        // Update fields
        if (updateData.getDiscountName() != null) {
            discount.setDiscountName(updateData.getDiscountName());
        }
        if (updateData.getDiscountValue() != null) {
            discount.setDiscountValue(updateData.getDiscountValue());
        }
        if (updateData.getMinPurchaseAmount() != null) {
            discount.setMinPurchaseAmount(updateData.getMinPurchaseAmount());
        }
        if (updateData.getMaxDiscountAmount() != null) {
            discount.setMaxDiscountAmount(updateData.getMaxDiscountAmount());
        }
        if (updateData.getStartDate() != null) {
            discount.setStartDate(updateData.getStartDate());
        }
        if (updateData.getEndDate() != null) {
            discount.setEndDate(updateData.getEndDate());
        }
        if (updateData.getUsageLimit() != null) {
            discount.setUsageLimit(updateData.getUsageLimit());
        }
        if (updateData.getIsActive() != null) {
            discount.setIsActive(updateData.getIsActive());
        }

        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            discount.setUpdatedBy(updater);
        }

        Discount savedDiscount = discountRepository.save(discount);
        log.info("Discount updated: {}", savedDiscount.getDiscountCode());

        return mapToResponse(savedDiscount);
    }

    /**
     * Delete discount
     */
    @Transactional
    public void deleteDiscount(Integer discountId) {
        log.info("Deleting discount ID: {}", discountId);

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with ID: " + discountId));

        discountRepository.delete(discount);
        log.info("Discount deleted: {}", discount.getDiscountCode());
    }

    /**
     * Deactivate discount
     */
    @Transactional
    public DiscountResponse deactivateDiscount(Integer discountId, Integer updatedBy) {
        log.info("Deactivating discount ID: {}", discountId);

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with ID: " + discountId));

        discount.setIsActive(false);

        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            discount.setUpdatedBy(updater);
        }

        Discount savedDiscount = discountRepository.save(discount);
        log.info("Discount deactivated: {}", savedDiscount.getDiscountCode());

        return mapToResponse(savedDiscount);
    }

    /**
     * Get all discounts
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getAllDiscounts() {
        return discountRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Map Discount entity to DiscountResponse DTO
     */
    private DiscountResponse mapToResponse(Discount discount) {
        DiscountResponse response = new DiscountResponse();
        response.setDiscountId(discount.getDiscountId());
        response.setDiscountCode(discount.getDiscountCode());
        response.setDiscountName(discount.getDiscountName());
        response.setDiscountType(discount.getDiscountType().name());
        response.setDiscountValue(discount.getDiscountValue());
        response.setMinPurchaseAmount(discount.getMinPurchaseAmount());
        response.setMaxDiscountAmount(discount.getMaxDiscountAmount());
        response.setApplicableTo(discount.getApplicableTo().name());
        response.setStartDate(discount.getStartDate());
        response.setEndDate(discount.getEndDate());
        response.setUsageLimit(discount.getUsageLimit());
        response.setTimesUsed(discount.getTimesUsed());
        response.setIsActive(discount.getIsActive());
        return response;
    }
}
