package com.wellness.backend.controller;

import com.wellness.backend.dto.ProductReviewDTO;
import com.wellness.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ProductReviewDTO> addReview(@RequestBody ProductReviewDTO dto) {
        return ResponseEntity.ok(reviewService.addReview(dto));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductReviewDTO>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductReviews(productId));
    }

    @DeleteMapping("/{id}")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/upvote")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<Void> upvoteReview(@PathVariable Long id, @RequestParam Long userId) {
        reviewService.upvoteReview(id, userId);
        return ResponseEntity.ok().build();
    }
}
