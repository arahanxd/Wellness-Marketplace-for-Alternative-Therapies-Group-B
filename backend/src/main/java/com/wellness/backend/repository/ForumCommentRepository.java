package com.wellness.backend.repository;

import com.wellness.backend.model.ForumCommentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumCommentEntity, Long> {
    List<ForumCommentEntity> findByAnswer_Id(Long answerId);
}
