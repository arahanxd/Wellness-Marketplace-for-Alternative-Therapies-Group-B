package com.wellness.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class AvailabilitySlotResponseDTO {
    private Long id;
    private Long providerId;
    private String providerName;
    private LocalDate availableDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isBlocked;
    private String dateStatus;
}
