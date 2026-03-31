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
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Discount Service - Enhanced for comprehensive discount configuration
 * Manages promotional discounts with support for multiple discount categories
 * and advanced filtering/priority handling
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DiscountService {

    private final DiscountRepository discountRepository;
    private final UserRepository userRepository;

    // ========== CREATE OPERATIONS ==========

    /**
     * Create a new discount from request DTO
     */
    @Transactional
    public DiscountResponse createDiscount(DiscountCreateRequest request, Integer createdBy) {
        log.info("Creating new discount: {}", request.getDiscountCode());

        // Validate discount code uniqueness
        if (discountRepository.findByDiscountCode(request.getDiscountCode()).isPresent()) {
            throw new BusinessRuleViolationException("Discount code already exists: " + request.getDiscountCode());
        }

        // Validate dates
        if (request.getEndDate() != null && request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date must be before end date");
        }

        // Map DTO to entity
        Discount discount = new Discount();
        discount.setDiscountCode(request.getDiscountCode());
        discount.setDiscountName(request.getDiscountName());
        discount.setDiscountCategory(Discount.DiscountCategory.valueOf(request.getDiscountCategory()));
        discount.setDiscountType(Discount.DiscountType.valueOf(request.getDiscountType()));
        discount.setDiscountValue(request.getDiscountValue());
        discount.setMinPurchaseAmount(request.getMinPurchaseAmount());
        discount.setMaxDiscountAmount(request.getMaxDiscountAmount());
        discount.setApplicableTo(Discount.ApplicableTo.valueOf(request.getApplicableTo()));
        discount.setApplicableIds(request.getApplicableIds());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        discount.setCustomerTypeCondition(Discount.CustomerTypeCondition.valueOf(request.getCustomerTypeCondition()));
        discount.setBulkThresholdQuantity(request.getBulkThresholdQuantity());
        discount.setPriorityLevel(request.getPriorityLevel() != null ? request.getPriorityLevel() : 0);
        discount.setUsageLimit(request.getUsageLimit());
        discount.setUsagePerCustomer(request.getUsagePerCustomer() != null ? request.getUsagePerCustomer() : 1);
        discount.setIsActive(request.getIsActive());

        if (createdBy != null) {
            User creator = userRepository.findById(createdBy).orElse(null);
            discount.setCreatedBy(creator);
        }

        Discount savedDiscount = discountRepository.save(discount);
        log.info("Discount created successfully: {}", savedDiscount.getDiscountCode());

        return mapToResponse(savedDiscount);
    }

    // ========== READ OPERATIONS ==========

    /**
     * Get all discounts
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getAllDiscounts() {
        log.info("Fetching all discounts");
        return discountRepository.findAll().stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(DiscountResponse::getDiscountId).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Get discount by ID
     */
    @Transactional(readOnly = true)
    public DiscountResponse getDiscountById(Integer discountId) {
        log.info("Fetching discount ID: {}", discountId);
        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with ID: " + discountId));
        return mapToResponse(discount);
    }

    /**
     * Get discount by code
     */
    @Transactional(readOnly = true)
    public DiscountResponse getDiscountByCode(String code) {
        log.info("Fetching discount by code: {}", code);
        Discount discount = discountRepository.findByDiscountCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Discount code not found: " + code));
        return mapToResponse(discount);
    }

    /**
     * Get all active discounts (enabled and within date range)
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getActiveDiscounts() {
        log.info("Fetching active discounts");
        return discountRepository.findActiveDiscounts(LocalDate.now()).stream()
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(DiscountResponse::getPriorityLevel).reversed()
                        .thenComparing(DiscountResponse::getDiscountId).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Get discounts by category
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getDiscountsByCategory(String category) {
        log.info("Fetching discounts by category: {}", category);
        try {
            Discount.DiscountCategory discountCategory = Discount.DiscountCategory.valueOf(category.toUpperCase());
            return discountRepository.findAll().stream()
                    .filter(d -> d.getDiscountCategory() == discountCategory)
                    .map(this::mapToResponse)
                    .sorted(Comparator.comparing(DiscountResponse::getPriorityLevel).reversed())
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid discount category: " + category);
        }
    }

    /**
     * Get applicable discounts for checkout
     * Filters by date, status, and product applicability
     */
    @Transactional(readOnly = true)
    public List<DiscountResponse> getApplicableDiscounts(Integer productId, Integer categoryId) {
        log.info("Fetching applicable discounts for product: {}, category: {}", productId, categoryId);
        return discountRepository.findActiveDiscounts(LocalDate.now()).stream()
                .filter(d -> d.appliesTo(productId, categoryId))
                .map(this::mapToResponse)
                .sorted(Comparator.comparing(DiscountResponse::getPriorityLevel).reversed())
                .collect(Collectors.toList());
    }

    // ========== UPDATE OPERATIONS ==========

    /**
     * Update an existing discount
     */
    @Transactional
    public DiscountResponse updateDiscount(Integer discountId, DiscountUpdateRequest request, Integer updatedBy) {
        log.info("Updating discount ID: {}", discountId);

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with ID: " + discountId));

        // Validate date range
        if (request.getEndDate() != null && request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date must be before end date");
        }

        // Update fields
        discount.setDiscountName(request.getDiscountName());
        discount.setDiscountCategory(Discount.DiscountCategory.valueOf(request.getDiscountCategory()));
        discount.setDiscountType(Discount.DiscountType.valueOf(request.getDiscountType()));
        discount.setDiscountValue(request.getDiscountValue());
        discount.setMinPurchaseAmount(request.getMinPurchaseAmount());
        discount.setMaxDiscountAmount(request.getMaxDiscountAmount());
        discount.setApplicableTo(Discount.ApplicableTo.valueOf(request.getApplicableTo()));
        discount.setApplicableIds(request.getApplicableIds());
        discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        discount.setCustomerTypeCondition(Discount.CustomerTypeCondition.valueOf(request.getCustomerTypeCondition()));
        discount.setBulkThresholdQuantity(request.getBulkThresholdQuantity());
        discount.setPriorityLevel(request.getPriorityLevel() != null ? request.getPriorityLevel() : 0);
        discount.setUsageLimit(request.getUsageLimit());
        discount.setUsagePerCustomer(request.getUsagePerCustomer() != null ? request.getUsagePerCustomer() : 1);
        discount.setIsActive(request.getIsActive());

        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            discount.setUpdatedBy(updater);
        }

        Discount savedDiscount = discountRepository.save(discount);
        log.info("Discount updated successfully: {}", savedDiscount.getDiscountCode());

        return mapToResponse(savedDiscount);
    }

    /**
     * Toggle discount active/inactive status
     */
    @Transactional
    public DiscountResponse toggleDiscountStatus(Integer discountId, Integer updatedBy) {
        log.info("Toggling discount status for ID: {}", discountId);

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with ID: " + discountId));

        discount.setIsActive(!discount.getIsActive());

        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            discount.setUpdatedBy(updater);
        }

        Discount savedDiscount = discountRepository.save(discount);
        log.info("Discount status toggled: {}", savedDiscount.getDiscountCode());

        return mapToResponse(savedDiscount);
    }

    /**
     * Deactivate a discount
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
     * Activate a discount
     */
    @Transactional
    public DiscountResponse activateDiscount(Integer discountId, Integer updatedBy) {
        log.info("Activating discount ID: {}", discountId);

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with ID: " + discountId));

        discount.setIsActive(true);

        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            discount.setUpdatedBy(updater);
        }

        Discount savedDiscount = discountRepository.save(discount);
        log.info("Discount activated: {}", savedDiscount.getDiscountCode());

        return mapToResponse(savedDiscount);
    }

    // ========== DELETE OPERATIONS ==========

    /**
     * Delete a discount
     */
    @Transactional
    public void deleteDiscount(Integer discountId) {
        log.info("Deleting discount ID: {}", discountId);

        Discount discount = discountRepository.findById(discountId)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with ID: " + discountId));

        discountRepository.delete(discount);
        log.info("Discount deleted: {}", discount.getDiscountCode());
    }

    // ========== VALIDATION OPERATIONS ==========

    /**
     * Validate a discount code for checkout
     */
    @Transactional(readOnly = true)
    public DiscountValidationResponse validateDiscount(DiscountValidationRequest request) {
        log.info("Validating discount code for checkout: {}", request.getDiscountCode());

        Discount discount = discountRepository.findByDiscountCode(request.getDiscountCode())
                .orElse(null);

        DiscountValidationResponse response = new DiscountValidationResponse();
        response.setDiscountCode(request.getDiscountCode());

        if (discount == null) {
            response.setIsValid(false);
            response.setMessage("Discount code not found");
            return response;
        }

        if (!discount.getIsActive()) {
            response.setIsValid(false);
            response.setMessage("Discount code is inactive");
            return response;
        }

        LocalDate today = LocalDate.now();
        if (today.isBefore(discount.getStartDate()) || today.isAfter(discount.getEndDate())) {
            response.setIsValid(false);
            response.setMessage("Discount code is expired or not yet active");
            return response;
        }

        // Check usage limit
        if (discount.getUsageLimit() != null && discount.getTimesUsed() >= discount.getUsageLimit()) {
            response.setIsValid(false);
            response.setMessage("Discount code usage limit has been reached");
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

    // ========== HELPER METHODS ==========

    /**
     * Map Discount entity to DiscountResponse DTO
     */
    private DiscountResponse mapToResponse(Discount discount) {
        DiscountResponse response = new DiscountResponse();
        response.setDiscountId(discount.getDiscountId());
        response.setDiscountCode(discount.getDiscountCode());
        response.setDiscountName(discount.getDiscountName());
        response.setDiscountCategory(discount.getDiscountCategory().name());
        response.setDiscountType(discount.getDiscountType().name());
        response.setDiscountValue(discount.getDiscountValue());
        response.setMinPurchaseAmount(discount.getMinPurchaseAmount());
        response.setMaxDiscountAmount(discount.getMaxDiscountAmount());
        response.setApplicableTo(discount.getApplicableTo().name());
        response.setApplicableIds(discount.getApplicableIds());
        response.setStartDate(discount.getStartDate());
        response.setEndDate(discount.getEndDate());
        response.setCustomerTypeCondition(discount.getCustomerTypeCondition().name());
        response.setBulkThresholdQuantity(discount.getBulkThresholdQuantity());
        response.setPriorityLevel(discount.getPriorityLevel());
        response.setUsageLimit(discount.getUsageLimit());
        response.setUsagePerCustomer(discount.getUsagePerCustomer());
        response.setTimesUsed(discount.getTimesUsed());
        response.setIsActive(discount.getIsActive());
        response.setCreatedAt(discount.getCreatedAt());
        response.setUpdatedAt(discount.getUpdatedAt());
        return response;
    }
}
