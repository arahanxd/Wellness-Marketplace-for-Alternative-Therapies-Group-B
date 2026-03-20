package com.wellness.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ForumAnswerDTO {
    private Long answerId;
    private Long questionId;
    private String content;
    private Long userId;
    private String userName;
    private String userRole;
    private Integer upvotes;
    private boolean accepted;
    private LocalDateTime createdAt;
    private boolean hasUpvoted;
    private List<ForumCommentDTO> comments;
}
