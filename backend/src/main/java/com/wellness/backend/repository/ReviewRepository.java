package com.wellness.backend.repository;

import com.wellness.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    Optional<Review> findBySessionIdAndUserId(Long sessionId, Long userId);
    
    Optional<Review> findByPractitionerIdAndUserId(Long practitionerId, Long userId);
    
    List<Review> findByPractitionerId(Long practitionerId);
}
