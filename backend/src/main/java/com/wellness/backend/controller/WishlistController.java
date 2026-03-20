package com.wellness.backend.controller;

import com.wellness.backend.dto.WishlistDTO;
import com.wellness.backend.dto.WishlistItemDTO;
import com.wellness.backend.service.UserService;
import com.wellness.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserService userService;

    // --- Flat endpoints (authenticated context) ---

    @GetMapping
    public ResponseEntity<List<WishlistDTO>> getUserWishlists() {
        return ResponseEntity.ok(wishlistService.getUserWishlists(getCurrentUserId()));
    }

    @PostMapping
    public ResponseEntity<WishlistDTO> createWishlist(@RequestParam String name) {
        return ResponseEntity.ok(wishlistService.createWishlist(getCurrentUserId(), name));
    }

    @PutMapping("/{wishlistId}")
    public ResponseEntity<WishlistDTO> renameWishlist(@PathVariable Long wishlistId, @RequestParam String name) {
        return ResponseEntity.ok(wishlistService.renameWishlist(getCurrentUserId(), wishlistId, name));
    }

    @DeleteMapping("/{wishlistId}")
    public ResponseEntity<?> deleteWishlist(@PathVariable Long wishlistId) {
        wishlistService.deleteWishlist(getCurrentUserId(), wishlistId);
        return ResponseEntity.ok(Map.of("message", "Wishlist deleted"));
    }

    @PostMapping("/{wishlistId}/add")
    public ResponseEntity<WishlistItemDTO> addItemToWishlist(@PathVariable Long wishlistId, @RequestParam Long productId) {
        return ResponseEntity.ok(wishlistService.addItemToWishlist(getCurrentUserId(), wishlistId, productId));
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<?> removeItemFromWishlist(@PathVariable Long itemId) {
        wishlistService.removeItemFromWishlist(getCurrentUserId(), itemId);
        return ResponseEntity.ok(Map.of("message", "Item removed from wishlist"));
    }

    // --- Existing endpoints (for backward compatibility) ---
    public ResponseEntity<List<WishlistDTO>> getUserWishlists(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getUserWishlists(userId));
    }

    @PostMapping("/user/{userId}")
    public ResponseEntity<WishlistDTO> createWishlist(@PathVariable Long userId, @RequestParam String name) {
        return ResponseEntity.ok(wishlistService.createWishlist(userId, name));
    }

    @DeleteMapping("/user/{userId}/{wishlistId}")
    public ResponseEntity<?> deleteWishlist(@PathVariable Long userId, @PathVariable Long wishlistId) {
        wishlistService.deleteWishlist(userId, wishlistId);
        return ResponseEntity.ok(Map.of("message", "Wishlist deleted"));
    }

    @PostMapping("/user/{userId}/{wishlistId}/add")
    public ResponseEntity<WishlistItemDTO> addItemToWishlist(@PathVariable Long userId, @PathVariable Long wishlistId, @RequestParam Long productId) {
        return ResponseEntity.ok(wishlistService.addItemToWishlist(userId, wishlistId, productId));
    }

    @DeleteMapping("/user/{userId}/item/{itemId}")
    public ResponseEntity<?> removeItemFromWishlist(@PathVariable Long userId, @PathVariable Long itemId) {
        wishlistService.removeItemFromWishlist(userId, itemId);
        return ResponseEntity.ok(Map.of("message", "Item removed from wishlist"));
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
