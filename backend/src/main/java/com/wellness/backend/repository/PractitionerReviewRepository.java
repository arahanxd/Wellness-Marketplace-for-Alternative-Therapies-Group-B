package com.wellness.backend.repository;

import com.wellness.backend.model.PractitionerReviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PractitionerReviewRepository extends JpaRepository<PractitionerReviewEntity, Long> {
    List<PractitionerReviewEntity> findByProvider_Id(Long providerId);

    @Query("SELECT r.rating, COUNT(r) FROM PractitionerReviewEntity r WHERE r.provider.id = :providerId GROUP BY r.rating")
    List<Object[]> countRatingsByProviderGroupId(Long providerId);

    boolean existsByBooking_Id(Long bookingId);
}
