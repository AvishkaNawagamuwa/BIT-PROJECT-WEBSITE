package com.sampathgrocery.repository.product;

import com.sampathgrocery.entity.product.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Brand Repository
 */
@Repository
public interface BrandRepository extends JpaRepository<Brand, Integer> {

    /**
     * Find brand by name
     */
    Optional<Brand> findByBrandName(String brandName);

    /**
     * Find all active brands
     */
    @Query("SELECT b FROM Brand b WHERE b.status = 'ACTIVE' ORDER BY b.brandName")
    List<Brand> findAllActive();

    /**
     * Find all brands ordered by name
     */
    @Query("SELECT b FROM Brand b ORDER BY b.brandName")
    List<Brand> findAllOrderByName();

    /**
     * Check if brand name exists
     */
    boolean existsByBrandName(String brandName);

    /**
     * Check if brand name exists excluding itself (for updates)
     */
    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM Brand b WHERE b.brandName = :brandName AND b.brandId != :brandId")
    boolean existsByBrandNameAndNotBrandId(String brandName, Integer brandId);
}
