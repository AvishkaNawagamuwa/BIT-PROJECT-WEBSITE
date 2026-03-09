package com.sampathgrocery.service.product;

import com.sampathgrocery.dto.product.ProductRequest;
import com.sampathgrocery.dto.product.ProductResponse;
import com.sampathgrocery.entity.product.*;
import com.sampathgrocery.exception.BadRequestException;
import com.sampathgrocery.exception.ResourceNotFoundException;
import com.sampathgrocery.repository.product.*;
import com.sampathgrocery.util.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final UnitOfMeasureRepository unitOfMeasureRepository;
    private final ProductBatchRepository productBatchRepository;

    public List<ProductResponse> getAllProducts(Integer categoryId, Boolean active) {
        List<Product> products;

        if (categoryId != null || active != null) {
            products = productRepository.findByCategoryAndStatus(categoryId, active);
        } else {
            products = productRepository.findAll();
        }

        return products.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ProductResponse getProductById(Integer id) {
        Product product = findById(id);
        return toResponse(product);
    }

    public ProductResponse getProductByCode(String code) {
        Product product = productRepository.findByProductCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "code", code));
        return toResponse(product);
    }

    public ProductResponse getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "barcode", barcode));
        return toResponse(product);
    }

    public List<ProductResponse> searchProducts(String query) {
        return productRepository.searchProducts(query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Search products with filters
     */
    public List<ProductResponse> searchProducts(String query, Integer categoryId, Boolean isActive) {
        if (categoryId != null && isActive != null) {
            return productRepository.findByCategoryAndStatus(categoryId, isActive)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } else if (isActive != null && isActive) {
            List<Product> products = productRepository.findByIsActiveTrue();
            if (query != null && !query.isBlank()) {
                products = products.stream()
                        .filter(p -> p.getProductName().toLowerCase().contains(query.toLowerCase()) ||
                                p.getProductCode().toLowerCase().contains(query.toLowerCase()))
                        .collect(Collectors.toList());
            }
            return products.stream().map(this::toResponse).collect(Collectors.toList());
        } else if (query != null) {
            return searchProducts(query);
        }
        return getAllProducts(null, null);
    }

    public ProductResponse createProduct(ProductRequest request, Integer createdBy) {
        // Validate category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        // Auto-generate product code if not provided
        String productCode = request.getProductCode();
        if (productCode == null || productCode.trim().isEmpty()) {
            productCode = generateProductCode();
        }

        // Auto-generate barcode if not provided
        String barcode = request.getBarcode();
        if (barcode == null || barcode.trim().isEmpty()) {
            barcode = generateBarcode();
        }

        // Check uniqueness
        if (productRepository.existsByProductCode(productCode)) {
            throw new BadRequestException("Product code already exists");
        }
        if (productRepository.existsByBarcode(barcode)) {
            throw new BadRequestException("Barcode already exists");
        }

        Product product = new Product();
        product.setProductCode(productCode);
        product.setProductName(request.getProductName());
        product.setCategory(category);
        
        // Set brand if provided
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.getBrandId()));
            product.setBrand(brand);
        }
        
        // Set unit (required)
        UnitOfMeasure unit = unitOfMeasureRepository.findById(request.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", request.getUnitId()));
        product.setUnit(unit);
        
        product.setBarcode(barcode);
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setReorderPoint(request.getReorderPoint());
        product.setReorderQuantity(request.getReorderQuantity());
        product.setIsActive(request.getIsActive());
        product.setCreatedBy(createdBy);
        product.setUpdatedBy(createdBy);

        product = productRepository.save(product);
        return toResponse(product);
    }

    public ProductResponse updateProduct(Integer id, ProductRequest request, Integer updatedBy) {
        Product product = findById(id);

        // Validate category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        // Check uniqueness
        if (productRepository.existsByProductCode(request.getProductCode())) {
            Product existing = productRepository.findByProductCode(request.getProductCode()).orElse(null);
            if (existing != null && !existing.getProductId().equals(id)) {
                throw new BadRequestException("Product code already exists");
            }
        }
        if (request.getBarcode() != null && productRepository.existsByBarcode(request.getBarcode())) {
            Product existing = productRepository.findByBarcode(request.getBarcode()).orElse(null);
            if (existing != null && !existing.getProductId().equals(id)) {
                throw new BadRequestException("Barcode already exists");
            }
        }

        product.setProductCode(request.getProductCode());
        product.setProductName(request.getProductName());
        product.setCategory(category);
        
        // Update brand if provided
        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", request.getBrandId()));
            product.setBrand(brand);
        } else {
            product.setBrand(null);
        }
        
        // Update unit (required)
        UnitOfMeasure unit = unitOfMeasureRepository.findById(request.getUnitId())
                .orElseThrow(() -> new ResourceNotFoundException("Unit", "id", request.getUnitId()));
        product.setUnit(unit);
        
        product.setBarcode(request.getBarcode());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setReorderPoint(request.getReorderPoint());
        product.setReorderQuantity(request.getReorderQuantity());
        product.setIsActive(request.getIsActive());
        product.setUpdatedBy(updatedBy);

        product = productRepository.save(product);
        return toResponse(product);
    }

    public void deleteProduct(Integer id) {
        Product product = findById(id);
        product.setIsActive(false);
        productRepository.save(product);
    }

    public String generateProductCode() {
        String lastCode = productRepository.findLastProductCode().orElse(null);
        return CodeGenerator.generateProductCode(lastCode);
    }

    public String generateBarcode() {
        String barcode;
        do {
            barcode = CodeGenerator.generateBarcode();
        } while (productRepository.existsByBarcode(barcode));
        return barcode;
    }

    public List<ProductResponse> getLowStockProducts() {
        List<Product> products = productRepository.findByIsActiveTrue();
        return products.stream()
                .map(this::toResponse)
                .filter(ProductResponse::getNeedsReorder)
                .collect(Collectors.toList());
    }

    // Helper methods
    private Product findById(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setProductId(product.getProductId());
        response.setProductCode(product.getProductCode());
        response.setProductName(product.getProductName());
        
        // Set category info (null-safe)
        if (product.getCategory() != null) {
            response.setCategoryId(product.getCategory().getCategoryId());
            response.setCategoryName(product.getCategory().getCategoryName());
        }
        
        // Set brand info
        if (product.getBrand() != null) {
            response.setBrandId(product.getBrand().getBrandId());
            response.setBrandName(product.getBrand().getBrandName());
        }
        
        // Set unit info
        if (product.getUnit() != null) {
            response.setUnitId(product.getUnit().getUnitId());
            response.setUnitCode(product.getUnit().getUnitCode());
            response.setUnitName(product.getUnit().getUnitName());
        }
        
        response.setBarcode(product.getBarcode());
        response.setDescription(product.getDescription());
        response.setImageUrl(product.getImageUrl());
        response.setReorderPoint(product.getReorderPoint());
        response.setReorderQuantity(product.getReorderQuantity());
        response.setIsActive(product.getIsActive());
        response.setCreatedAt(product.getCreatedAt());

        // Calculate total stock
        Integer totalStock = productBatchRepository.getTotalStockByProduct(product.getProductId());
        response.setTotalStock(totalStock);
        response.setNeedsReorder(totalStock <= product.getReorderPoint());

        return response;
    }
}
