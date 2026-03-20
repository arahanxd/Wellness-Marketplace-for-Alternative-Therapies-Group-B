package com.wellness.backend.controller;

import com.wellness.backend.dto.CartItemDTO;
import com.wellness.backend.service.CartService;
import com.wellness.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    // --- Flat endpoints (authenticated context) ---

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart() {
        return ResponseEntity.ok(cartService.getUserCart(getCurrentUserId()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addToCart(@RequestParam Long productId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.addToCart(getCurrentUserId(), productId, quantity));
    }

    @PutMapping("/update")
    public ResponseEntity<CartItemDTO> updateQuantity(@RequestParam Long productId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateQuantityByProductId(getCurrentUserId(), productId, quantity));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long productId) {
        cartService.removeByProductId(getCurrentUserId(), productId);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        cartService.clearCart(getCurrentUserId());
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }

    // --- Existing endpoints (for backward compatibility) ---
    public ResponseEntity<List<CartItemDTO>> getUserCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getUserCart(userId));
    }

    @PostMapping("/user/{userId}/add")
    public ResponseEntity<CartItemDTO> addToCart(@PathVariable Long userId, @RequestParam Long productId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.addToCart(userId, productId, quantity));
    }

    @PutMapping("/user/{userId}/update/{cartItemId}")
    public ResponseEntity<CartItemDTO> updateQuantity(@PathVariable Long userId, @PathVariable Long cartItemId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateQuantity(userId, cartItemId, quantity));
    }

    @DeleteMapping("/user/{userId}/remove/{cartItemId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long userId, @PathVariable Long cartItemId) {
        cartService.removeFromCart(userId, cartItemId);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }

    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<?> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }

    private Long getCurrentUserId() {
        String email = "";
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"))
                .getId();
    }
}
