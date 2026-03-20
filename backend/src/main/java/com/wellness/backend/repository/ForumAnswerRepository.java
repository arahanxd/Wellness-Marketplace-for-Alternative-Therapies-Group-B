package com.wellness.backend.repository;

import com.wellness.backend.model.ForumAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ForumAnswerRepository extends JpaRepository<ForumAnswerEntity, Long> {
    List<ForumAnswerEntity> findByQuestion_Id(Long questionId);
}
