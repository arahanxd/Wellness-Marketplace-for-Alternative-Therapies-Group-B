package com.wellness.backend.service;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.model.WeeklyAvailabilityEntity;
import com.wellness.backend.repository.UserRepository;
import com.wellness.backend.repository.WeeklyAvailabilityRepository;
import com.wellness.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WeeklyAvailabilityService {

    private final WeeklyAvailabilityRepository weeklyAvailabilityRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<WeeklyAvailabilityEntity> getWeeklyAvailability(Long providerId) {
        return weeklyAvailabilityRepository.findByProvider_Id(providerId);
    }

    @Transactional
    public WeeklyAvailabilityEntity addOrUpdateSlot(String providerEmail, DayOfWeek day, LocalTime start,
            LocalTime end) {
        UserEntity provider = userRepository.findByEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        WeeklyAvailabilityEntity slot = WeeklyAvailabilityEntity.builder()
                .provider(provider)
                .dayOfWeek(day)
                .startTime(start)
                .endTime(end)
                .isEnabled(true)
                .build();

        return weeklyAvailabilityRepository.save(slot);
    }

    @Transactional
    public void deleteSlot(Long id, String providerEmail) {
        WeeklyAvailabilityEntity slot = weeklyAvailabilityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (!slot.getProvider().getEmail().equals(providerEmail)) {
            throw new RuntimeException("Unauthorized to delete this slot");
        }

        weeklyAvailabilityRepository.delete(slot);
    }

    @Transactional
    public void toggleDay(Long providerId, DayOfWeek day, boolean enabled) {
        List<WeeklyAvailabilityEntity> slots = weeklyAvailabilityRepository
                .findByProvider_IdAndDayOfWeekAndIsEnabledTrue(providerId, day);
        for (WeeklyAvailabilityEntity slot : slots) {
            slot.setEnabled(enabled);
            weeklyAvailabilityRepository.save(slot);
        }
    }
}
