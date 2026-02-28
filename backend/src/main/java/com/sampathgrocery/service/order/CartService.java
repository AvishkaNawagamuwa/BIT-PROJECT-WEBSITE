package com.sampathgrocery.service.order;

import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.entity.order.*;
import com.sampathgrocery.entity.product.ProductBatch;
import com.sampathgrocery.entity.user.User;
import com.sampathgrocery.exception.*;
import com.sampathgrocery.repository.order.*;
import com.sampathgrocery.repository.product.ProductBatchRepository;
import com.sampathgrocery.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Cart Service - Manages shopping cart for online customers
 * Supports both user-based and session-based carts
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductBatchRepository batchRepository;
    private final UserRepository userRepository;

    /**
     * Get or create cart for a user
     */
    @Transactional
    public CartResponse getOrCreateUserCart(Integer userId) {
        Cart cart = cartRepository.findByUserUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setExpiresAt(LocalDateTime.now().plusDays(7)); // 7 days expiry
                    return cartRepository.save(newCart);
                });

        return mapToResponse(cart);
    }

    /**
     * Get or create cart for a session
     */
    @Transactional
    public CartResponse getOrCreateSessionCart(String sessionId) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new BadRequestException("Session ID is required");
        }

        Cart cart = cartRepository.findBySessionId(sessionId)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setSessionId(sessionId);
                    newCart.setExpiresAt(LocalDateTime.now().plusDays(1)); // 1 day expiry for guest
                    return cartRepository.save(newCart);
                });

        return mapToResponse(cart);
    }

    /**
     * Add item to cart (or update quantity if already exists)
     */
    @Transactional
    public CartResponse addItemToCart(Integer cartId, CartItemAddRequest request) {
        log.info("Adding item to cart {} - Batch: {}, Qty: {}", cartId, request.getBatchId(), request.getQuantity());

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found with ID: " + cartId));

        ProductBatch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product batch not found with ID: " + request.getBatchId()));

        // Check stock availability
        if (batch.getStockQuantity() < request.getQuantity()) {
            throw new InsufficientStockException(
                    String.format("Insufficient stock for product '%s'. Available: %d, Requested: %d",
                            batch.getProduct().getProductName(), batch.getStockQuantity(), request.getQuantity()));
        }

        // Check if item already exists in cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getBatch().getBatchId().equals(request.getBatchId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            // Update quantity
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (batch.getStockQuantity() < newQuantity) {
                throw new InsufficientStockException(
                        String.format("Cannot add more. Total would be %d, but only %d available",
                                newQuantity, batch.getStockQuantity()));
            }
            existingItem.updateQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            // Add new item
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setBatch(batch);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setUnitPrice(batch.getSellingPrice());
            cartItem.calculateLineTotal();
            cart.addItem(cartItem);
            cartItemRepository.save(cartItem);
        }

        // Update cart expiry
        cart.setExpiresAt(LocalDateTime.now().plusDays(cart.getUser() != null ? 7 : 1));
        cartRepository.save(cart);

        log.info("Item added to cart successfully");
        return mapToResponse(cart);
    }

    /**
     * Update cart item quantity
     */
    @Transactional
    public CartResponse updateCartItem(Integer cartItemId, CartItemUpdateRequest request) {
        log.info("Updating cart item {} to quantity {}", cartItemId, request.getQuantity());

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartItemId));

        // Check stock availability
        if (cartItem.getBatch().getStockQuantity() < request.getQuantity()) {
            throw new InsufficientStockException(
                    String.format("Insufficient stock. Available: %d, Requested: %d",
                            cartItem.getBatch().getStockQuantity(), request.getQuantity()));
        }

        cartItem.updateQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        return mapToResponse(cartItem.getCart());
    }

    /**
     * Remove item from cart
     */
    @Transactional
    public CartResponse removeCartItem(Integer cartItemId) {
        log.info("Removing cart item {}", cartItemId);

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with ID: " + cartItemId));

        Cart cart = cartItem.getCart();
        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);

        return mapToResponse(cart);
    }

    /**
     * Clear all items from cart
     */
    @Transactional
    public void clearCart(Integer cartId) {
        log.info("Clearing cart {}", cartId);

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found with ID: " + cartId));

        cart.clearItems();
        cartItemRepository.deleteAll(cart.getItems());
        cartRepository.save(cart);
    }

    /**
     * Delete expired carts (scheduled task - runs daily at 02:00)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredCarts() {
        log.info("Starting cleanup of expired carts");
        List<Cart> expiredCarts = cartRepository.findExpiredCarts(LocalDateTime.now());

        int expiredCount = expiredCarts.size();
        for (Cart cart : expiredCarts) {
            cartItemRepository.deleteAll(cart.getItems());
        }

        cartRepository.deleteExpiredCarts(LocalDateTime.now());
        log.info("Deleted {} expired carts", expiredCount);
    }

    /**
     * Map Cart entity to CartResponse DTO
     */
    private CartResponse mapToResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setCartId(cart.getCartId());
        response.setUserId(cart.getUser() != null ? cart.getUser().getUserId() : null);
        response.setSessionId(cart.getSessionId());

        // Map items
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
        response.setItems(items);

        // Calculate total
        BigDecimal total = cart.getItems().stream()
                .map(CartItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.setTotal(total);

        response.setExpiresAt(cart.getExpiresAt());
        response.setCreatedAt(cart.getCreatedAt());
        response.setUpdatedAt(cart.getUpdatedAt());
        return response;
    }

    /**
     * Map CartItem entity to CartItemResponse DTO
     */
    private CartItemResponse mapItemToResponse(CartItem item) {
        CartItemResponse response = new CartItemResponse();
        response.setCartItemId(item.getCartItemId());
        response.setBatchId(item.getBatch().getBatchId());
        response.setProductName(item.getBatch().getProduct().getProductName());
        response.setProductCode(item.getBatch().getProduct().getProductCode());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setLineTotal(item.getLineTotal());
        response.setAvailableStock(item.getBatch().getStockQuantity());
        return response;
    }
}
