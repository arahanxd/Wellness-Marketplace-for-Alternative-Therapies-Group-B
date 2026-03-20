package com.wellness.backend.service;

import com.wellness.backend.dto.CartItemDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.CartItemEntity;
import com.wellness.backend.model.ProductEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.CartItemRepository;
import com.wellness.backend.repository.ProductRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<CartItemDTO> getUserCart(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return cartItemRepository.findByUser(user).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CartItemDTO addToCart(Long userId, Long productId, Integer quantity) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        CartItemEntity cartItem = cartItemRepository.findByUserAndProduct_ProductId(user, productId)
                .orElse(new CartItemEntity());

        if (cartItem.getId() == null) {
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
        } else {
            cartItem.setQuantity(cartItem.getQuantity() + quantity);
        }

        CartItemEntity saved = cartItemRepository.save(cartItem);
        return mapToDTO(saved);
    }

    public CartItemDTO updateQuantity(Long userId, Long cartItemId, Integer quantity) {
        CartItemEntity cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Forbidden: Not your cart item");
        }

        cartItem.setQuantity(quantity);
        CartItemEntity saved = cartItemRepository.save(cartItem);
        return mapToDTO(saved);
    }

    public CartItemDTO updateQuantityByProductId(Long userId, Long productId, Integer quantity) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CartItemEntity cartItem = cartItemRepository.findByUserAndProduct_ProductId(user, productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not in cart"));

        cartItem.setQuantity(quantity);
        CartItemEntity saved = cartItemRepository.save(cartItem);
        return mapToDTO(saved);
    }

    public void removeFromCart(Long userId, Long cartItemId) {
        CartItemEntity cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Forbidden: Not your cart item");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void removeByProductId(Long userId, Long productId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        cartItemRepository.deleteByUserAndProduct_ProductId(user, productId);
    }

    @Transactional
    public void clearCart(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        cartItemRepository.deleteByUser(user);
    }

    private CartItemDTO mapToDTO(CartItemEntity entity) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProduct().getProductId());
        dto.setName(entity.getProduct().getName());
        dto.setImageUrl(entity.getProduct().getImageUrl());
        
        BigDecimal originalPrice = entity.getProduct().getPrice();
        Integer discountPct = entity.getProduct().getDiscountPercentage();
        BigDecimal discountedPrice = originalPrice;
        
        if (discountPct != null && discountPct > 0) {
            BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                new BigDecimal(discountPct).divide(new BigDecimal(100), 2, RoundingMode.HALF_UP)
            );
            discountedPrice = originalPrice.multiply(discountMultiplier);
        }
        
        dto.setPrice(discountedPrice);
        dto.setQuantity(entity.getQuantity());
        dto.setSubtotal(discountedPrice.multiply(new BigDecimal(entity.getQuantity())));
        dto.setDiscountPercentage(discountPct);
        return dto;
    }
}
