package com.wellness.backend.repository;

import com.wellness.backend.model.WeeklyAvailabilityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface WeeklyAvailabilityRepository extends JpaRepository<WeeklyAvailabilityEntity, Long> {
    List<WeeklyAvailabilityEntity> findByProvider_Id(Long providerId);

    List<WeeklyAvailabilityEntity> findByProvider_IdAndDayOfWeekAndIsEnabledTrue(Long providerId, DayOfWeek dayOfWeek);
}
