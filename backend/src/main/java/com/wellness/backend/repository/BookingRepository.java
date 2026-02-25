package com.wellness.backend.repository;

import com.wellness.backend.model.BookingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    List<BookingEntity> findByUser_Id(Long userId);

    List<BookingEntity> findByPractitioner_Id(Long practitionerId);

    boolean existsByPractitioner_IdAndBookingDate(Long practitionerId, LocalDateTime bookingDate);
}
