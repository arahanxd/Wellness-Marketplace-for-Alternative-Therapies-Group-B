package com.wellness.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StarRatingDTO {
    private long oneStar;
    private long twoStar;
    private long threeStar;
    private long fourStar;
    private long fiveStar;
    private long totalReviews;

    public static StarRatingDTO empty() {
        return new StarRatingDTO(0L, 0L, 0L, 0L, 0L, 0L);
    }
}
