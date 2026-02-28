package com.sampathgrocery.service.product;

import com.sampathgrocery.dto.product.StockMovementResponse;
import com.sampathgrocery.entity.product.ProductBatch;
import com.sampathgrocery.entity.product.StockMovement;
import com.sampathgrocery.entity.product.StockMovement.MovementType;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.product.ProductBatchRepository;
import com.sampathgrocery.repository.product.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Stock Movement Service - Tracks all inventory movements
 */
@Service
@RequiredArgsConstructor
@Transactional
public class StockMovementService {

    private final StockMovementRepository movementRepository;
    private final ProductBatchRepository batchRepository;

    /**
     * Log a stock movement (called by other services)
     */
    public StockMovementResponse logMovement(Integer batchId, MovementType movementType,
            Integer quantity, String referenceNumber, String referenceType,
            String notes, Integer createdBy) {

        ProductBatch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "id", batchId));

        int beforeQuantity = batch.getStockQuantity() - quantity;
        int afterQuantity = batch.getStockQuantity();

        StockMovement movement = new StockMovement();
        movement.setBatch(batch);
        movement.setMovementType(movementType);
        movement.setQuantity(quantity);
        movement.setBeforeQuantity(beforeQuantity);
        movement.setAfterQuantity(afterQuantity);
        movement.setReferenceNumber(referenceNumber);
        movement.setReferenceType(referenceType);
        movement.setNotes(notes);
        movement.setCreatedBy(createdBy);

        movement = movementRepository.save(movement);
        return toResponse(movement);
    }

    public List<StockMovementResponse> getMovementsByBatch(Integer batchId) {
        List<StockMovement> movements = movementRepository.findByBatchBatchIdOrderByCreatedAtDesc(batchId);
        return movements.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<StockMovementResponse> getMovementsByProduct(Integer productId) {
        List<StockMovement> movements = movementRepository.findByProductId(productId);
        return movements.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<StockMovementResponse> getMovementsByType(MovementType movementType) {
        List<StockMovement> movements = movementRepository.findByMovementTypeOrderByCreatedAtDesc(movementType);
        return movements.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<StockMovementResponse> getRecentMovements(int limit) {
        List<StockMovement> movements = movementRepository.findRecentMovements(limit);
        return movements.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private StockMovementResponse toResponse(StockMovement movement) {
        StockMovementResponse response = new StockMovementResponse();
        response.setMovementId(movement.getMovementId());
        response.setBatchId(movement.getBatch().getBatchId());
        response.setBatchCode(movement.getBatch().getBatchCode());
        response.setProductId(movement.getBatch().getProduct().getProductId());
        response.setProductName(movement.getBatch().getProduct().getProductName());
        response.setMovementType(movement.getMovementType());
        response.setQuantity(movement.getQuantity());
        response.setBeforeQuantity(movement.getBeforeQuantity());
        response.setAfterQuantity(movement.getAfterQuantity());
        response.setReferenceNumber(movement.getReferenceNumber());
        response.setReferenceType(movement.getReferenceType());
        response.setNotes(movement.getNotes());
        response.setCreatedAt(movement.getCreatedAt());
        response.setCreatedBy(movement.getCreatedBy());

        return response;
    }
}
