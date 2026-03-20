package com.wellness.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ForumCommentDTO {
    private Long commentId;
    private Long answerId;
    private String content;
    private Long userId;
    private String userName;
    private String userRole;
    private LocalDateTime createdAt;
}
