package com.wellness.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReportDTO {
    private Long reportId;
    private Long reporterId;
    private String reporterName;
    
    private Long reportedEntityId;
    private String entityType; // "QUESTION", "ANSWER", "COMMENT"
    private String reportedContent; 
    
    private String reason;
    private String comment; // any extra note from reporter
    private String status;
    private LocalDateTime createdAt;
}
