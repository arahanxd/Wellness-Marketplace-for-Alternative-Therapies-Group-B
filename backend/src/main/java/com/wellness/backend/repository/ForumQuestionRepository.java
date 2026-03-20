package com.wellness.backend.repository;

import com.wellness.backend.model.ForumQuestionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumQuestionRepository extends JpaRepository<ForumQuestionEntity, Long> {
    List<ForumQuestionEntity> findAllByOrderByCreatedAtDesc();
    List<ForumQuestionEntity> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(String title, String content);
    long countByProduct_ProductId(Long productId);
}
