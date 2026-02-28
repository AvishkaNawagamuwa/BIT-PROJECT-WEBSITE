package com.sampathgrocery.controller;

import com.sampathgrocery.dto.common.ApiResponse;
import com.sampathgrocery.dto.order.*;
import com.sampathgrocery.service.order.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Cart Controller - REST API endpoints for shopping cart management
 * Supports both user-based and session-based carts for online ordering
 */
@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Slf4j
public class CartController {

    private final CartService cartService;

    /**
     * Get or create cart for logged-in user
     * GET /api/cart/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<CartResponse>> getUserCart(@PathVariable Integer userId) {
        log.info("REST: Getting cart for user ID: {}", userId);
        CartResponse response = cartService.getOrCreateUserCart(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Get or create cart for guest (session-based)
     * GET /api/cart/session/{sessionId}
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<CartResponse>> getSessionCart(@PathVariable String sessionId) {
        log.info("REST: Getting cart for session ID: {}", sessionId);
        CartResponse response = cartService.getOrCreateSessionCart(sessionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Add item to cart
     * POST /api/cart/{cartId}/items
     */
    @PostMapping("/{cartId}/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItemToCart(
            @PathVariable Integer cartId,
            @Valid @RequestBody CartItemAddRequest request) {
        log.info("REST: Adding item to cart ID: {}", cartId);
        CartResponse response = cartService.addItemToCart(cartId, request);
        return ResponseEntity.ok(ApiResponse.success("Item added to cart successfully", response));
    }

    /**
     * Update cart item quantity
     * PUT /api/cart/items/{itemId}
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Integer itemId,
            @Valid @RequestBody CartItemUpdateRequest request) {
        log.info("REST: Updating cart item ID: {}", itemId);
        CartResponse response = cartService.updateCartItem(itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully", response));
    }

    /**
     * Remove item from cart
     * DELETE /api/cart/items/{itemId}
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeCartItem(@PathVariable Integer itemId) {
        log.info("REST: Removing cart item ID: {}", itemId);
        CartResponse response = cartService.removeCartItem(itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart successfully", response));
    }

    /**
     * Clear all items from cart
     * DELETE /api/cart/{cartId}/items
     */
    @DeleteMapping("/{cartId}/items")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable Integer cartId) {
        log.info("REST: Clearing cart ID: {}", cartId);
        cartService.clearCart(cartId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}
