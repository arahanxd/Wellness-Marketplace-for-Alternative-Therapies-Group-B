package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDTO {
    private boolean alreadyReviewed;
    private String message;
    private ExistingReviewDTO existingReview;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExistingReviewDTO {
        private int rating;
        private String comment;
    }
}
