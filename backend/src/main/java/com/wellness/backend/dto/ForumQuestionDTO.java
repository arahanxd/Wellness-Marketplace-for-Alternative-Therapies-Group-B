package com.wellness.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ForumQuestionDTO {
    private Long questionId;
    private String title;
    private String content;
    private Long userId;
    private String userName;
    private Long productId;
    private String name;
    private Integer upvotes;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private Integer answerCount;
    private boolean hasUpvoted;
    private List<ForumAnswerDTO> answers;
}
