package com.wellness.backend.repository;

import com.wellness.backend.model.ProductQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductQuestionRepository extends JpaRepository<ProductQuestionEntity, Long> {
    List<ProductQuestionEntity> findByProduct_ProductId(Long productId);
}
