package com.wellness.backend.repository;

import com.wellness.backend.model.WishlistEntity;
import com.wellness.backend.model.WishlistItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItemEntity, Long> {
    List<WishlistItemEntity> findByWishlist(WishlistEntity wishlist);
    Optional<WishlistItemEntity> findByWishlistAndProduct_ProductId(WishlistEntity wishlist, Long productId);
}
