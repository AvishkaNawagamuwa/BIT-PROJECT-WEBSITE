package com.sampathgrocery.service.customer;

import com.sampathgrocery.dto.customer.*;
import com.sampathgrocery.entity.customer.Customer;
import com.sampathgrocery.entity.customer.CustomerProfile;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.BusinessRuleViolationException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.customer.CustomerProfileRepository;
import com.sampathgrocery.repository.customer.CustomerRepository;
import com.sampathgrocery.repository.user.UserRepository;
import com.sampathgrocery.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Customer Management
 * Handles customer CRUD, loyalty points, and profile management
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerProfileRepository profileRepository;
    private final UserRepository userRepository;

    private static final BigDecimal LOYALTY_POINT_VALUE = BigDecimal.valueOf(10); // 1 point = Rs. 10

    /**
     * Create a new customer
     */
    @Transactional
    public CustomerResponse createCustomer(CustomerCreateRequest request, Integer createdBy) {
        log.info("Creating new customer: {}", request.getFullName());

        // Validate phone uniqueness
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new BusinessRuleViolationException("Phone number already registered");
        }

        // Validate email uniqueness if provided
        if (request.getEmail() != null && !request.getEmail().isEmpty() &&
                customerRepository.existsByEmail(request.getEmail())) {
            throw new BusinessRuleViolationException("Email already registered");
        }

        // Validate NIC uniqueness if provided
        if (request.getNic() != null && !request.getNic().isEmpty() &&
                customerRepository.existsByNic(request.getNic())) {
            throw new BusinessRuleViolationException("NIC already registered");
        }

        // Generate customer code
        String lastCode = customerRepository.findLatestCustomerCode();
        String customerCode = CodeGenerator.generateCustomerCode(lastCode);

        Customer customer = new Customer();
        customer.setCustomerCode(customerCode);
        customer.setFullName(request.getFullName());
        customer.setPhone(request.getPhone());
        customer.setAlternatePhone(request.getAlternatePhone());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setLoyaltyPoints(0);
        customer.setNic(request.getNic());
        customer.setLoyaltyTier(Customer.LoyaltyTier.BRONZE);
        customer.setTotalPurchases(BigDecimal.ZERO);
        customer.setTotalOrders(0);
        customer.setIsActive(true);

        // Link to user account if provided
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));
            customer.setUser(user);
        }

        if (createdBy != null) {
            User creator = userRepository.findById(createdBy).orElse(null);
            customer.setCreatedBy(creator);
        }

        Customer savedCustomer = customerRepository.save(customer);

        // Generate loyalty card number after save (uses customer ID)
        savedCustomer.setLoyaltyCardNumber(CodeGenerator.generateLoyaltyCardNumber(savedCustomer.getCustomerId()));
        savedCustomer = customerRepository.save(savedCustomer);

        // Create empty customer profile
        CustomerProfile profile = new CustomerProfile();
        profile.setCustomer(savedCustomer);
        profileRepository.save(profile);

        log.info("Customer created: {}", customerCode);
        return mapToResponse(savedCustomer);
    }

    /**
     * Update existing customer
     */
    @Transactional
    public CustomerResponse updateCustomer(Integer customerId, CustomerUpdateRequest request, Integer updatedBy) {
        log.info("Updating customer ID: {}", customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        // Update fields if provided
        if (request.getFullName() != null) {
            customer.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            // Check if phone is already used by another customer
            customerRepository.findByPhone(request.getPhone()).ifPresent(c -> {
                if (!c.getCustomerId().equals(customerId)) {
                    throw new BusinessRuleViolationException("Phone number already used by another customer");
                }
            });
            customer.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            // Check if email is already used by another customer
            customerRepository.findByEmail(request.getEmail()).ifPresent(c -> {
                if (!c.getCustomerId().equals(customerId)) {
                    throw new BusinessRuleViolationException("Email already used by another customer");
                }
            });
            customer.setEmail(request.getEmail());
        }
        if (request.getAlternatePhone() != null) {
            customer.setAlternatePhone(request.getAlternatePhone());
        }
        if (request.getAddress() != null) {
            customer.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            customer.setCity(request.getCity());
        }
        if (request.getIsActive() != null) {
            customer.setIsActive(request.getIsActive());
        }

        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            customer.setUpdatedBy(updater);
        }
        if (request.getNic() != null) {
            customerRepository.findByNic(request.getNic()).ifPresent(c -> {
                if (!c.getCustomerId().equals(customerId)) {
                    throw new BusinessRuleViolationException("NIC already used by another customer");
                }
            });
            customer.setNic(request.getNic());
        }

        Customer updatedCustomer = customerRepository.save(customer);
        log.info("Customer updated: {}", customer.getCustomerCode());
        return mapToResponse(updatedCustomer);
    }

    /**
     * Get customer by ID
     */
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));
        return mapToResponse(customer);
    }

    /**
     * Get customer by code
     */
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByCode(String customerCode) {
        Customer customer = customerRepository.findByCustomerCode(customerCode)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with code: " + customerCode));
        return mapToResponse(customer);
    }

    /**
     * Get customer by phone
     */
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerByPhone(String phone) {
        Customer customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with phone: " + phone));
        return mapToResponse(customer);
    }

    /**
     * Get all customers
     */
    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get all active customers
     */
    @Transactional(readOnly = true)
    public List<CustomerResponse> getActiveCustomers() {
        return customerRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search customers by keyword
     */
    @Transactional(readOnly = true)
    public List<CustomerResponse> searchCustomers(String keyword, Boolean active) {
        if (active != null) {
            return customerRepository.searchCustomersByActiveStatus(keyword, active).stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
        return customerRepository.searchCustomers(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get customers by loyalty tier
     */
    @Transactional(readOnly = true)
    public List<CustomerResponse> getCustomersByTier(String tier) {
        Customer.LoyaltyTier loyaltyTier;
        try {
            loyaltyTier = Customer.LoyaltyTier.valueOf(tier.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid loyalty tier: " + tier);
        }
        return customerRepository.findActiveCustomersByTier(loyaltyTier).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Deactivate customer (soft delete)
     */
    @Transactional
    public void deactivateCustomer(Integer customerId, Integer updatedBy) {
        log.info("Deactivating customer ID: {}", customerId);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        customer.setIsActive(false);
        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            customer.setUpdatedBy(updater);
        }
        customerRepository.save(customer);
        log.info("Customer deactivated: {}", customer.getCustomerCode());
    }

    /**
     * Activate customer
     */
    @Transactional
    public void activateCustomer(Integer customerId, Integer updatedBy) {
        log.info("Activating customer ID: {}", customerId);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        customer.setIsActive(true);
        if (updatedBy != null) {
            User updater = userRepository.findById(updatedBy).orElse(null);
            customer.setUpdatedBy(updater);
        }
        customerRepository.save(customer);
        log.info("Customer activated: {}", customer.getCustomerCode());
    }

    /**
     * Delete customer (soft delete - alias for deactivateCustomer)
     */
    @Transactional
    public void deleteCustomer(Integer customerId) {
        deactivateCustomer(customerId, null);
    }

    /**
     * Add loyalty points to customer (called when order is completed)
     */
    @Transactional
    public CustomerResponse addLoyaltyPoints(Integer customerId, Integer points) {
        log.info("Adding {} loyalty points to customer ID: {}", points, customerId);
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        customer.addLoyaltyPoints(points);
        customerRepository.save(customer);
        log.info("Loyalty points added. New balance: {} points | Tier: {}",
                customer.getLoyaltyPoints(), customer.getLoyaltyTier());

        return mapToResponse(customer);
    }

    /**
     * Redeem loyalty points for discount
     */
    @Transactional
    public LoyaltyRedemptionResponse redeemLoyaltyPoints(Integer customerId, LoyaltyRedemptionRequest request) {
        log.info("Redeeming {} loyalty points for customer ID: {}", request.getPointsToRedeem(), customerId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        // Check if customer has enough points
        if (customer.getLoyaltyPoints() < request.getPointsToRedeem()) {
            throw new BusinessRuleViolationException(
                    String.format("Insufficient loyalty points. Available: %d, Requested: %d",
                            customer.getLoyaltyPoints(), request.getPointsToRedeem()));
        }

        // Redeem points
        boolean redeemed = customer.redeemLoyaltyPoints(request.getPointsToRedeem());
        if (!redeemed) {
            throw new BusinessRuleViolationException("Failed to redeem loyalty points");
        }

        // Calculate discount amount (1 point = Rs. 10)
        BigDecimal discountAmount = LOYALTY_POINT_VALUE.multiply(BigDecimal.valueOf(request.getPointsToRedeem()));

        customerRepository.save(customer);

        LoyaltyRedemptionResponse response = new LoyaltyRedemptionResponse();
        response.setPointsRedeemed(request.getPointsToRedeem());
        response.setDiscountAmount(discountAmount);
        response.setRemainingPoints(customer.getLoyaltyPoints());
        response.setMessage("Successfully redeemed " + request.getPointsToRedeem() + " points");

        log.info("Loyalty points redeemed. Discount: Rs.{}, Remaining points: {}",
                discountAmount, customer.getLoyaltyPoints());
        return response;
    }

    /**
     * Update customer purchase statistics (called after order completion)
     */
    @Transactional
    public void updatePurchaseStats(Integer customerId, BigDecimal purchaseAmount) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + customerId));

        customer.setTotalPurchases(customer.getTotalPurchases().add(purchaseAmount));
        customer.setTotalOrders(customer.getTotalOrders() + 1);
        customerRepository.save(customer);
    }

    /**
     * Map entity to response DTO
     */
    private CustomerResponse mapToResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setCustomerId(customer.getCustomerId());
        response.setCustomerCode(customer.getCustomerCode());
        response.setUserId(customer.getUser() != null ? customer.getUser().getUserId() : null);
        response.setFullName(customer.getFullName());
        response.setPhone(customer.getPhone());
        response.setAlternatePhone(customer.getAlternatePhone());
        response.setEmail(customer.getEmail());
        response.setAddress(customer.getAddress());
        response.setCity(customer.getCity());
        response.setLoyaltyCardNumber(customer.getLoyaltyCardNumber());
        response.setNic(customer.getNic());
        response.setLoyaltyPoints(customer.getLoyaltyPoints());
        response.setLoyaltyTier(customer.getLoyaltyTier().name());
        response.setTotalPurchases(customer.getTotalPurchases());
        response.setTotalOrders(customer.getTotalOrders());
        response.setIsActive(customer.getIsActive());
        response.setCreatedAt(customer.getCreatedAt());
        response.setUpdatedAt(customer.getUpdatedAt());
        return response;
    }
}
