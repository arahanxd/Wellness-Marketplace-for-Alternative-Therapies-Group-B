package com.wellness.backend.service;

import com.wellness.backend.dto.AvailabilitySlotRequestDTO;
import com.wellness.backend.dto.AvailabilitySlotResponseDTO;
import com.wellness.backend.exception.ForbiddenActionException;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.ProviderAvailabilityEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.ProviderAvailabilityRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProviderAvailabilityService {

    private final ProviderAvailabilityRepository availabilityRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AvailabilitySlotResponseDTO> getAvailability(Long providerId) {
        return availabilityRepository.findByProvider_Id(providerId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AvailabilitySlotResponseDTO addSlot(String providerEmail, AvailabilitySlotRequestDTO request) {
        UserEntity provider = userRepository.findByEmail(providerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + providerEmail));

        if (request.getEndTime().isBefore(request.getStartTime()) ||
                request.getEndTime().equals(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Check for overlap with existing slots on the same date
        List<ProviderAvailabilityEntity> existing = availabilityRepository
                .findByProviderIdAndAvailableDate(provider.getId(), request.getAvailableDate());

        for (ProviderAvailabilityEntity slot : existing) {
            boolean overlaps = request.getStartTime().isBefore(slot.getEndTime())
                    && request.getEndTime().isAfter(slot.getStartTime());
            if (overlaps) {
                throw new IllegalArgumentException(
                        "This time slot overlaps with an existing availability slot on " + request.getAvailableDate());
            }
        }

        ProviderAvailabilityEntity entity = new ProviderAvailabilityEntity();
        entity.setProvider(provider);
        entity.setAvailableDate(request.getAvailableDate());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setBlocked(false);

        ProviderAvailabilityEntity saved = availabilityRepository.save(entity);
        log.info("✅ Availability slot added for provider {} on {} ({} - {})",
                provider.getEmail(), request.getAvailableDate(), request.getStartTime(), request.getEndTime());
        return toDto(saved);
    }

    @Transactional
    public void deleteSlot(Long slotId, String providerEmail) {
        ProviderAvailabilityEntity slot = availabilityRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Availability slot not found: " + slotId));

        if (!slot.getProvider().getEmail().equalsIgnoreCase(providerEmail)) {
            throw new ForbiddenActionException("You are not allowed to delete this slot");
        }

        availabilityRepository.delete(slot);
        log.info("🗑️ Availability slot {} deleted by provider {}", slotId, providerEmail);
    }

    private AvailabilitySlotResponseDTO toDto(ProviderAvailabilityEntity entity) {
        return AvailabilitySlotResponseDTO.builder()
                .id(entity.getId())
                .providerId(entity.getProvider().getId())
                .providerName(entity.getProvider().getName())
                .availableDate(entity.getAvailableDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .isBlocked(entity.isBlocked())
                .dateStatus(entity.getDateStatus())
                .build();
    }
}
