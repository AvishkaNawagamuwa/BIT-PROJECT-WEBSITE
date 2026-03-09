package com.sampathgrocery.service.supplier;

import com.sampathgrocery.dto.supplier.*;
import com.sampathgrocery.entity.product.Product;
import com.sampathgrocery.entity.supplier.PurchaseOrder;
import com.sampathgrocery.entity.supplier.PurchaseOrderItem;
import com.sampathgrocery.entity.supplier.Supplier;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.BusinessRuleViolationException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.product.ProductRepository;
import com.sampathgrocery.repository.supplier.PurchaseOrderItemRepository;
import com.sampathgrocery.repository.supplier.PurchaseOrderRepository;
import com.sampathgrocery.repository.supplier.SupplierRepository;
import com.sampathgrocery.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    public List<PurchaseOrderResponse> getAllPurchaseOrders(String query, Integer supplierId,
            PurchaseOrder.POStatus status, LocalDate fromDate, LocalDate toDate) {

        List<PurchaseOrder> orders = purchaseOrderRepository.searchPurchaseOrders(
                query, supplierId, status, fromDate, toDate);

        return orders.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PurchaseOrderResponse getPurchaseOrderById(Integer id) {
        PurchaseOrder po = findById(id);
        return toResponseWithItems(po);
    }

    public PurchaseOrderResponse createPurchaseOrder(PurchaseOrderRequest request, Integer createdBy) {
        // Validate supplier
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));

        // Validate items
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Purchase order must have at least one item");
        }

        // Create PO
        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber(generatePONumber());
        po.setSupplier(supplier);
        po.setRequestedDate(request.getRequestedDate());
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        po.setStatus(PurchaseOrder.POStatus.DRAFT);
        po.setNotes(request.getNotes());
        po.setRequestedBy(createdBy);
        po.setTaxAmount(request.getTaxAmount());
        po.setDiscountAmount(request.getDiscountAmount());

        po = purchaseOrderRepository.save(po);

        // Create PO items and calculate totals
        BigDecimal subtotal = BigDecimal.ZERO;
        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemReq.getProductId()));

            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setPurchaseOrder(po);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setExpectedUnitPrice(itemReq.getExpectedUnitPrice());
            item.setNotes(itemReq.getNotes());

            if (itemReq.getExpectedUnitPrice() != null) {
                BigDecimal lineTotal = itemReq.getExpectedUnitPrice()
                        .multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                item.setLineTotal(lineTotal);
                subtotal = subtotal.add(lineTotal);
            }

            purchaseOrderItemRepository.save(item);
        }

        // Update totals
        po.setSubtotal(subtotal);
        BigDecimal grandTotal = subtotal.add(request.getTaxAmount()).subtract(request.getDiscountAmount());
        po.setGrandTotal(grandTotal);
        po = purchaseOrderRepository.save(po);

        return toResponseWithItems(po);
    }

    public PurchaseOrderResponse submitForApproval(Integer id) {
        PurchaseOrder po = findById(id);

        if (po.getStatus() != PurchaseOrder.POStatus.DRAFT) {
            throw new BusinessRuleViolationException("Only DRAFT purchase orders can be submitted");
        }

        po.setStatus(PurchaseOrder.POStatus.PENDING);
        po = purchaseOrderRepository.save(po);

        return toResponse(po);
    }

    public PurchaseOrderResponse approvePurchaseOrder(Integer id, Integer approvedBy) {
        PurchaseOrder po = findById(id);

        if (po.getStatus() != PurchaseOrder.POStatus.PENDING) {
            throw new BusinessRuleViolationException("Only PENDING purchase orders can be approved");
        }

        po.setStatus(PurchaseOrder.POStatus.APPROVED);
        po.setApprovedBy(approvedBy);
        po.setApprovedDate(LocalDateTime.now());
        po = purchaseOrderRepository.save(po);

        return toResponse(po);
    }

    public PurchaseOrderResponse rejectPurchaseOrder(Integer id, String reason) {
        PurchaseOrder po = findById(id);

        if (po.getStatus() != PurchaseOrder.POStatus.PENDING) {
            throw new BusinessRuleViolationException("Only PENDING purchase orders can be rejected");
        }

        po.setStatus(PurchaseOrder.POStatus.REJECTED);
        po.setRejectionReason(reason);
        po = purchaseOrderRepository.save(po);

        return toResponse(po);
    }

    public PurchaseOrderResponse markAsOrdered(Integer id) {
        PurchaseOrder po = findById(id);

        if (po.getStatus() != PurchaseOrder.POStatus.APPROVED) {
            throw new BusinessRuleViolationException("Only APPROVED purchase orders can be marked as ordered");
        }

        po.setStatus(PurchaseOrder.POStatus.ORDERED);
        po = purchaseOrderRepository.save(po);

        return toResponse(po);
    }

    public PurchaseOrderResponse cancelPurchaseOrder(Integer id, String reason) {
        PurchaseOrder po = findById(id);

        // Can cancel DRAFT or APPROVED purchase orders
        if (po.getStatus() != PurchaseOrder.POStatus.DRAFT &&
                po.getStatus() != PurchaseOrder.POStatus.APPROVED) {
            throw new BusinessRuleViolationException(
                    "Only DRAFT or APPROVED purchase orders can be cancelled. Current status: " + po.getStatus());
        }

        po.setStatus(PurchaseOrder.POStatus.CANCELLED);
        po.setRejectionReason(reason);
        po = purchaseOrderRepository.save(po);

        return toResponse(po);
    }

    public PurchaseOrderResponse markAsCompleted(Integer id) {
        PurchaseOrder po = findById(id);
        po.setStatus(PurchaseOrder.POStatus.RECEIVED);
        po = purchaseOrderRepository.save(po);
        return toResponse(po);
    }

    public Long countActivePurchaseOrders() {
        return purchaseOrderRepository.countActivePurchaseOrders();
    }

    public String generatePONumber() {
        String lastCode = purchaseOrderRepository.findLastPoNumber().orElse(null);
        return CodeGenerator.generatePONumber(lastCode);
    }

    // Helper methods
    private PurchaseOrder findById(Integer id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PurchaseOrder", "id", id));
    }

    private PurchaseOrderResponse toResponse(PurchaseOrder po) {
        PurchaseOrderResponse response = new PurchaseOrderResponse();
        response.setRequestId(po.getRequestId());
        response.setPoNumber(po.getPoNumber());
        response.setSupplierId(po.getSupplier().getSupplierId());
        response.setSupplierName(po.getSupplier().getSupplierName());
        response.setSupplierContact(po.getSupplier().getPhone());
        response.setStatus(po.getStatus());
        response.setRequestedDate(po.getRequestedDate());
        response.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        response.setSubtotal(po.getSubtotal());
        response.setTaxAmount(po.getTaxAmount());
        response.setDiscountAmount(po.getDiscountAmount());
        response.setGrandTotal(po.getGrandTotal());
        response.setNotes(po.getNotes());
        response.setRejectionReason(po.getRejectionReason());
        response.setRequestedBy(po.getRequestedBy());
        response.setApprovedBy(po.getApprovedBy());
        response.setApprovedDate(po.getApprovedDate());
        response.setCreatedAt(po.getCreatedAt());
        return response;
    }

    private PurchaseOrderResponse toResponseWithItems(PurchaseOrder po) {
        PurchaseOrderResponse response = toResponse(po);

        List<PurchaseOrderItem> items = purchaseOrderItemRepository
                .findByPurchaseOrderRequestId(po.getRequestId());

        response.setItems(items.stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList()));
        response.setTotalItems(items.size());
        response.setTotalQuantity(items.stream().mapToInt(PurchaseOrderItem::getQuantity).sum());

        return response;
    }

    private PurchaseOrderItemResponse toItemResponse(PurchaseOrderItem item) {
        PurchaseOrderItemResponse response = new PurchaseOrderItemResponse();
        response.setReorderItemId(item.getReorderItemId());
        response.setProductId(item.getProduct().getProductId());
        response.setProductName(item.getProduct().getProductName());
        response.setProductCode(item.getProduct().getProductCode());
        response.setQuantity(item.getQuantity());
        response.setExpectedUnitPrice(item.getExpectedUnitPrice());
        response.setLineTotal(item.getLineTotal());
        response.setNotes(item.getNotes());
        return response;
    }
}
