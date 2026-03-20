package com.wellness.backend.dto;

import lombok.Data;

@Data
public class ReportRequestDTO {
    private Long reporterId;
    private Long reportedEntityId;
    private String entityType; // PRODUCT_QUESTION, FORUM_QUESTION, etc.
    private String reason;
    private String comment;
}
