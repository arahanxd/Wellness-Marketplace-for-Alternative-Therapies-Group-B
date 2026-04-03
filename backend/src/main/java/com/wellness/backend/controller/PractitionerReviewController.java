package com.wellness.backend.controller;

import com.wellness.backend.dto.PractitionerReviewDTO;
import com.wellness.backend.service.PractitionerReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews/practitioner")
@RequiredArgsConstructor
public class PractitionerReviewController {

    private final PractitionerReviewService reviewService;

    @PostMapping
    public ResponseEntity<PractitionerReviewDTO> addReview(@RequestBody PractitionerReviewDTO dto) {
        return ResponseEntity.ok(reviewService.addReview(dto));
    }

    @GetMapping("/{providerId}")
    public ResponseEntity<List<PractitionerReviewDTO>> getReviews(@PathVariable Long providerId) {
        return ResponseEntity.ok(reviewService.getPractitionerReviews(providerId));
    }
}
