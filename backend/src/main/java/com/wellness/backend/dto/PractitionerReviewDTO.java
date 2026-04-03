package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PractitionerReviewDTO {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long providerId;
    private String providerName;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
