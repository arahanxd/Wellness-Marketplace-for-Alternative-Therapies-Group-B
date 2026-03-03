package com.wellness.backend.repository;

import com.wellness.backend.model.SessionBookingEntity;
import com.wellness.backend.model.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface SessionBookingRepository extends JpaRepository<SessionBookingEntity, Long> {

    List<SessionBookingEntity> findByProvider_Id(Long providerId);

    List<SessionBookingEntity> findByClient_Id(Long clientId);

    @Query("SELECT s FROM SessionBookingEntity s WHERE s.provider.id = :providerId " +
            "AND (s.sessionDate > :currentDate OR (s.sessionDate = :currentDate AND s.startTime > :currentTime)) " +
            "AND s.status NOT IN (:excludedStatuses)")
    List<SessionBookingEntity> findUpcomingSessionsForProvider(
            @Param("providerId") Long providerId,
            @Param("currentDate") LocalDate currentDate,
            @Param("currentTime") LocalTime currentTime,
            @Param("excludedStatuses") List<SessionStatus> excludedStatuses);

    @Query("SELECT s FROM SessionBookingEntity s WHERE s.client.id = :clientId " +
            "AND (s.sessionDate > :currentDate OR (s.sessionDate = :currentDate AND s.startTime > :currentTime)) " +
            "AND s.status NOT IN (:excludedStatuses)")
    List<SessionBookingEntity> findUpcomingSessionsForClient(
            @Param("clientId") Long clientId,
            @Param("currentDate") LocalDate currentDate,
            @Param("currentTime") LocalTime currentTime,
            @Param("excludedStatuses") List<SessionStatus> excludedStatuses);

    List<SessionBookingEntity> findByStatusInAndReminderSentFalse(List<SessionStatus> statuses);

    List<SessionBookingEntity> findByProvider_IdAndSessionDate(Long providerId, LocalDate sessionDate);

    List<SessionBookingEntity> findByStatusIn(List<SessionStatus> statuses);
}
