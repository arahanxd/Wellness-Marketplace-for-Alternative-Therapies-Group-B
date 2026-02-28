package com.wellness.backend.repository;

import com.wellness.backend.model.SessionBookingEntity;
import com.wellness.backend.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SessionBookingRepository extends JpaRepository<SessionBookingEntity, Long> {

    List<SessionBookingEntity> findByProvider_Id(Long providerId);

    List<SessionBookingEntity> findByClient_Id(Long clientId);

    List<SessionBookingEntity> findByStatusAndReminderSentFalse(SessionStatus status);

    List<SessionBookingEntity> findBySessionDateAndStatus(LocalDate sessionDate, SessionStatus status);
}

