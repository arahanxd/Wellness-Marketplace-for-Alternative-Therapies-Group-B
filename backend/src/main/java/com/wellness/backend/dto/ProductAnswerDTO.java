package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductAnswerDTO {
    private Long answerId;
    private Long questionId;
    private Long userId;
    private String userName;
    private String userRole;
    private String content;
    private LocalDateTime createdAt;
}
