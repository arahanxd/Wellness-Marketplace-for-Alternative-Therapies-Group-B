package com.wellness.backend.repository;

import com.wellness.backend.model.ProviderAvailabilityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderAvailabilityRepository extends JpaRepository<ProviderAvailabilityEntity, Long> {

    /** All slots for a given provider id (column-based FK). */
    List<ProviderAvailabilityEntity> findByProviderId(Long providerId);

    /** All slots for a given provider (relationship-based). */
    List<ProviderAvailabilityEntity> findByProvider_Id(Long providerId);

    /** Slots on a specific date. */
    List<ProviderAvailabilityEntity> findByProviderIdAndAvailableDate(Long providerId, LocalDate availableDate);

    /**
     * Finds a provider availability slot that covers the requested time window.
     * The slot must start at or before the requested start and end at or after the
     * requested end.
     */
    @Query("SELECT a FROM ProviderAvailabilityEntity a " +
            "WHERE a.provider.id = :providerId " +
            "AND a.availableDate = :date " +
            "AND a.startTime <= :startTime " +
            "AND a.endTime >= :endTime " +
            "AND a.isBlocked = false")
    Optional<ProviderAvailabilityEntity> findCoveringSlot(
            @Param("providerId") Long providerId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
}
