package com.wellness.backend.service;

import com.wellness.backend.dto.WishlistDTO;
import com.wellness.backend.dto.WishlistItemDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.ProductEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.model.WishlistEntity;
import com.wellness.backend.model.WishlistItemEntity;
import com.wellness.backend.repository.ProductRepository;
import com.wellness.backend.repository.UserRepository;
import com.wellness.backend.repository.WishlistItemRepository;
import com.wellness.backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<WishlistDTO> getUserWishlists(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return wishlistRepository.findByUser(user).stream()
                .map(this::mapWishlistToDTO)
                .collect(Collectors.toList());
    }

    public WishlistDTO createWishlist(Long userId, String name) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        WishlistEntity wishlist = new WishlistEntity();
        wishlist.setName(name);
        wishlist.setUser(user);

        WishlistEntity saved = wishlistRepository.save(wishlist);
        return mapWishlistToDTO(saved);
    }

    public void deleteWishlist(Long userId, Long wishlistId) {
        WishlistEntity wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));

        if (!wishlist.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Forbidden: Not your wishlist");
        }

        wishlistRepository.delete(wishlist);
    }

    public WishlistDTO renameWishlist(Long userId, Long wishlistId, String name) {
        WishlistEntity wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));

        if (!wishlist.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Forbidden: Not your wishlist");
        }

        wishlist.setName(name);
        return mapWishlistToDTO(wishlistRepository.save(wishlist));
    }

    public WishlistItemDTO addItemToWishlist(Long userId, Long wishlistId, Long productId) {
        WishlistEntity wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist not found"));

        if (!wishlist.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Forbidden: Not your wishlist");
        }

        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        WishlistItemEntity item = wishlistItemRepository.findByWishlistAndProduct_ProductId(wishlist, productId)
                .orElse(new WishlistItemEntity());

        if (item.getId() == null) {
            item.setWishlist(wishlist);
            item.setProduct(product);
            item = wishlistItemRepository.save(item);
        }

        return mapItemToDTO(item);
    }

    public void removeItemFromWishlist(Long userId, Long itemId) {
        WishlistItemEntity item = wishlistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist item not found"));

        if (!item.getWishlist().getUser().getId().equals(userId)) {
            throw new IllegalStateException("Forbidden: Not your wishlist item");
        }

        wishlistItemRepository.delete(item);
    }

    private WishlistDTO mapWishlistToDTO(WishlistEntity entity) {
        WishlistDTO dto = new WishlistDTO();
        dto.setWishlistId(entity.getWishlistId());
        dto.setName(entity.getName());
        dto.setUserId(entity.getUser().getId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setItems(wishlistItemRepository.findByWishlist(entity).stream()
                .map(this::mapItemToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private WishlistItemDTO mapItemToDTO(WishlistItemEntity entity) {
        WishlistItemDTO dto = new WishlistItemDTO();
        dto.setId(entity.getId());
        dto.setProductId(entity.getProduct().getProductId());
        dto.setName(entity.getProduct().getName());
        dto.setImageUrl(entity.getProduct().getImageUrl());
        dto.setPrice(entity.getProduct().getPrice());
        dto.setAddedAt(entity.getAddedAt());
        return dto;
    }
}
