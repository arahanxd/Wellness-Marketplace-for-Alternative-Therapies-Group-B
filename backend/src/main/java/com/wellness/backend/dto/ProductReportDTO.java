package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductReportDTO {
    private Long reportId;
    private Long questionId;
    private String questionContent;
    private Long userId;
    private String userName;
    private String reason;
    private String comment;
    private String status;
    private LocalDateTime createdAt;
}
