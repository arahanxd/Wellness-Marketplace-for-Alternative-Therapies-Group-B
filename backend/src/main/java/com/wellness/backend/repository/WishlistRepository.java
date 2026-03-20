package com.wellness.backend.repository;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.model.WishlistEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistEntity, Long> {
    List<WishlistEntity> findByUser(UserEntity user);
}
