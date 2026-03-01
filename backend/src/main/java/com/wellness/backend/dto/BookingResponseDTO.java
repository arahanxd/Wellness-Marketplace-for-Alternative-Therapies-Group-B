package com.wellness.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingResponseDTO {
    private Long id;
    private Long userId;
    private String clientName;
    private String clientEmail;

    private LocalDateTime bookingDate;
    private String startTime;
    private Integer duration;
    private String notes; // Patient comment
    private String practitionerComment;
    private String status;
    private java.math.BigDecimal sessionFee;

    private UserDTO practitioner;
}
