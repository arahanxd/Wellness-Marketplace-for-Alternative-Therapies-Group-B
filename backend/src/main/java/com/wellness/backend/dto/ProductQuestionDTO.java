package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductQuestionDTO {
    private Long questionId;
    private Long productId;
    private Long userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
    private List<ProductAnswerDTO> answers;
}
