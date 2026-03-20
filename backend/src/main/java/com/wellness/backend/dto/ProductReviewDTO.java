package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductReviewDTO {
    private Long reviewId;
    private Long productId;
    private Long userId;
    private String userName;
    private Integer rating;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private Integer helpfulVotes;
    private Boolean hasUpvoted;
}
