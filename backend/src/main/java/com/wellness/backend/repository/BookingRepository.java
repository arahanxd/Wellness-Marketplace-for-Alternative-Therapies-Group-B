package com.wellness.backend.repository;

import com.wellness.backend.model.Booking;
import com.wellness.backend.model.SessionStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByProvider_Id(Long providerId);

    List<Booking> findByClient_Id(Long clientId);

    @Query("SELECT s FROM Booking s WHERE s.provider.id = :providerId " +
            "AND (s.sessionDate > :currentDate OR (s.sessionDate = :currentDate AND s.startTime > :currentTime)) " +
            "AND s.status NOT IN (:excludedStatuses)")
    List<Booking> findUpcomingSessionsForProvider(
            @Param("providerId") Long providerId,
            @Param("currentDate") LocalDate currentDate,
            @Param("currentTime") LocalTime currentTime,
            @Param("excludedStatuses") List<SessionStatus> excludedStatuses);

    @Query("SELECT s FROM Booking s WHERE s.client.id = :clientId " +
            "AND (s.sessionDate > :currentDate OR (s.sessionDate = :currentDate AND s.startTime > :currentTime)) " +
            "AND s.status NOT IN (:excludedStatuses)")
    List<Booking> findUpcomingSessionsForClient(
            @Param("clientId") Long clientId,
            @Param("currentDate") LocalDate currentDate,
            @Param("currentTime") LocalTime currentTime,
            @Param("excludedStatuses") List<SessionStatus> excludedStatuses);

    List<Booking> findByStatusInAndReminderSentFalse(List<SessionStatus> statuses);

    List<Booking> findByProvider_IdAndSessionDate(Long providerId, LocalDate sessionDate);

    List<Booking> findByStatusIn(List<SessionStatus> statuses);

    @Query("SELECT s FROM Booking s WHERE s.status IN (com.wellness.backend.model.SessionStatus.CONFIRMED, com.wellness.backend.model.SessionStatus.ACCEPTED) " +
            "AND (s.sessionDate < :currentDate OR (s.sessionDate = :currentDate AND s.endTime < :currentTime))")
    List<Booking> findStaleConfirmedSessions(
            @Param("currentDate") LocalDate currentDate,
            @Param("currentTime") LocalTime currentTime);

    @Query("SELECT COUNT(s) > 0 FROM Booking s WHERE s.provider.id = :providerId " +
            "AND s.sessionDate = :sessionDate AND s.startTime = :startTime " +
            "AND s.status IN (com.wellness.backend.model.SessionStatus.ACCEPTED, com.wellness.backend.model.SessionStatus.CONFIRMED)")
    boolean hasConflictingConfirmedSession(
            @Param("providerId") Long providerId,
            @Param("sessionDate") LocalDate sessionDate,
            @Param("startTime") LocalTime startTime);

    // Analytics Queries
    @Query("SELECT SUM(s.provider.sessionFee) FROM Booking s WHERE s.provider.id = :providerId " +
            "AND s.sessionDate BETWEEN :startDate AND :endDate " +
            "AND s.status = com.wellness.backend.model.SessionStatus.COMPLETED")
    BigDecimal sumSessionRevenueByPractitionerAndDateRange(
            @Param("providerId") Long providerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(s.provider.sessionFee) FROM Booking s WHERE s.provider.id = :providerId " +
            "AND s.status = com.wellness.backend.model.SessionStatus.COMPLETED")
    BigDecimal sumTotalSessionRevenueByPractitioner(@Param("providerId") Long providerId);

    long countByClient_IdAndStatusIn(Long clientId, List<SessionStatus> statuses);

    @Query("SELECT SUM(s.provider.sessionFee) FROM Booking s WHERE s.client.id = :clientId " +
            "AND s.status = com.wellness.backend.model.SessionStatus.COMPLETED")
    BigDecimal sumTotalSessionSpentByPatient(@Param("clientId") Long clientId);

    @Query("SELECT SUM(s.provider.sessionFee) FROM Booking s WHERE s.client.id = :clientId " +
            "AND s.sessionDate BETWEEN :startDate AND :endDate " +
            "AND s.status = com.wellness.backend.model.SessionStatus.COMPLETED")
    BigDecimal sumSessionSpentByPatientAndDateRange(
            @Param("clientId") Long clientId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT s FROM Booking s WHERE s.client.id = :clientId ORDER BY s.sessionDate DESC, s.startTime DESC")
    List<Booking> findRecentSessionsByClient(@Param("clientId") Long clientId, Pageable pageable);
}
