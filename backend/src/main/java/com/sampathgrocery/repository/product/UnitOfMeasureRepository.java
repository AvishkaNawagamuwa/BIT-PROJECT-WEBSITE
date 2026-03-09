package com.sampathgrocery.repository.product;

import com.sampathgrocery.entity.product.UnitOfMeasure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Unit of Measure Repository
 */
@Repository
public interface UnitOfMeasureRepository extends JpaRepository<UnitOfMeasure, Integer> {

    /**
     * Find unit by code
     */
    Optional<UnitOfMeasure> findByUnitCode(String unitCode);

    /**
     * Find unit by name
     */
    Optional<UnitOfMeasure> findByUnitName(String unitName);

    /**
     * Find all active units
     */
    @Query("SELECT u FROM UnitOfMeasure u WHERE u.status = 'ACTIVE' ORDER BY u.unitName")
    List<UnitOfMeasure> findAllActive();

    /**
     * Find all units ordered by name
     */
    @Query("SELECT u FROM UnitOfMeasure u ORDER BY u.unitName")
    List<UnitOfMeasure> findAllOrderByName();

    /**
     * Check if unit code exists
     */
    boolean existsByUnitCode(String unitCode);

    /**
     * Check if unit name exists
     */
    boolean existsByUnitName(String unitName);

    /**
     * Check if unit code exists excluding itself (for updates)
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM UnitOfMeasure u WHERE u.unitCode = :unitCode AND u.unitId != :unitId")
    boolean existsByUnitCodeAndNotUnitId(String unitCode, Integer unitId);

    /**
     * Check if unit name exists excluding itself (for updates)
     */
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM UnitOfMeasure u WHERE u.unitName = :unitName AND u.unitId != :unitId")
    boolean existsByUnitNameAndNotUnitId(String unitName, Integer unitId);
}
