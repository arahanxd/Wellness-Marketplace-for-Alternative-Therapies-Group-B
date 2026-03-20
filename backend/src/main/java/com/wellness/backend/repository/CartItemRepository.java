package com.wellness.backend.repository;

import com.wellness.backend.model.CartItemEntity;
import com.wellness.backend.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {
    List<CartItemEntity> findByUser(UserEntity user);
    Optional<CartItemEntity> findByUserAndProduct_ProductId(UserEntity user, Long productId);
    void deleteByUser(UserEntity user);
    void deleteByUserAndProduct_ProductId(UserEntity user, Long productId);
}
