package com.wellness.backend.repository;

import com.wellness.backend.model.ProductReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReviewEntity, Long> {
    List<ProductReviewEntity> findByProduct_ProductId(Long productId);
    List<ProductReviewEntity> findByProduct_ProductIdAndStatusNotIn(Long productId, java.util.Collection<String> statuses);
    long countByProduct_ProductIdAndStatusNotIn(Long productId, java.util.Collection<String> statuses);
}
