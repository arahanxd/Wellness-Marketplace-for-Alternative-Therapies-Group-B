package com.wellness.backend.repository;

import com.wellness.backend.model.ProductAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductAnswerRepository extends JpaRepository<ProductAnswerEntity, Long> {
    List<ProductAnswerEntity> findByQuestion_QuestionId(Long questionId);
}
