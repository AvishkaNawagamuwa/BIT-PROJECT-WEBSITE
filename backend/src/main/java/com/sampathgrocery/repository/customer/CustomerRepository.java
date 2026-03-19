package com.sampathgrocery.repository.customer;

import com.sampathgrocery.entity.customer.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Customer entity
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByCustomerCode(String customerCode);

    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByLoyaltyCardNumber(String loyaltyCardNumber);

    Optional<Customer> findByUser_UserId(Integer userId);

    List<Customer> findByIsActiveTrue();

    List<Customer> findByLoyaltyTier(Customer.LoyaltyTier loyaltyTier);

    @Query("SELECT c FROM Customer c WHERE c.isActive = true AND c.loyaltyTier = :tier")
    List<Customer> findActiveCustomersByTier(@Param("tier") Customer.LoyaltyTier tier);

    @Query("SELECT c FROM Customer c WHERE " +
            "LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Customer> searchCustomers(@Param("search") String search);

    @Query("SELECT c FROM Customer c WHERE c.isActive = :active " +
            "AND (LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Customer> searchCustomersByActiveStatus(@Param("search") String search, @Param("active") Boolean active);

    @Query("SELECT c FROM Customer c WHERE c.city = :city AND c.isActive = true")
    List<Customer> findByCity(@Param("city") String city);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByCustomerCode(String customerCode);

    boolean existsByNic(String nic);

    Optional<Customer> findByNic(String nic);

    @Query("SELECT MAX(c.customerCode) FROM Customer c WHERE c.customerCode LIKE 'CUST-%'")
    String findLatestCustomerCode();
}
