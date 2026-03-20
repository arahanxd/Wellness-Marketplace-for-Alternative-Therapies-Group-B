package com.wellness.backend.service;

import com.wellness.backend.dto.ProductReviewDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.ProductEntity;
import com.wellness.backend.model.ProductReviewEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.OrderRepository;
import com.wellness.backend.repository.ProductRepository;
import com.wellness.backend.repository.ProductReviewRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ProductReviewDTO addReview(ProductReviewDTO dto) {
        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProductEntity product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Purchase and Delivery verification
        boolean hasBeenDelivered = orderRepository.findByUser(user).stream()
                .anyMatch(order -> order.getProduct().getProductId().equals(dto.getProductId()) &&
                        ("COMPLETED".equalsIgnoreCase(order.getStatus()) ||
                                "DELIVERED".equalsIgnoreCase(order.getStatus()) ||
                                "DELIVERED".equalsIgnoreCase(order.getDeliveryStatus())));

        if (!hasBeenDelivered) {
            throw new IllegalStateException("Only users who have received the product can leave a review");
        }

        // Prevent duplicate reviews
        boolean alreadyReviewed = reviewRepository.findByProduct_ProductId(dto.getProductId()).stream()
                .anyMatch(r -> r.getUser().getId().equals(user.getId()));

        if (alreadyReviewed) {
            throw new IllegalStateException(
                    "You have already reviewed this product. Only one review per product is allowed.");
        }

        ProductReviewEntity review = new ProductReviewEntity();
        review.setRating(dto.getRating());
        review.setTitle(dto.getTitle());
        review.setDescription(dto.getDescription());
        review.setUser(user);
        review.setProduct(product);

        ProductReviewEntity saved = reviewRepository.save(review);
        return mapToDTO(saved, user.getId());
    }

    public List<ProductReviewDTO> getProductReviews(Long productId) {
        return reviewRepository.findByProduct_ProductIdAndStatusNotIn(productId, Arrays.asList("REMOVED", "BLOCKED"))
                .stream()
                .map(review -> mapToDTO(review, null))
                .collect(Collectors.toList());
    }

    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review not found with ID: " + reviewId);
        }
        reviewRepository.deleteById(reviewId);
    }

    public void upvoteReview(Long reviewId, Long userId) {
        ProductReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with ID: " + reviewId));
        
        if (review.getUpvotedUserIds().contains(userId)) {
            review.getUpvotedUserIds().remove(userId);
            review.setHelpfulVotes(Math.max(0, review.getHelpfulVotes() - 1));
        } else {
            review.getUpvotedUserIds().add(userId);
            review.setHelpfulVotes(review.getHelpfulVotes() + 1);
        }
        reviewRepository.save(review);
    }

    public ProductReviewDTO mapToDTO(ProductReviewEntity entity, Long currentUserId) {
        ProductReviewDTO dto = new ProductReviewDTO();
        dto.setReviewId(entity.getReviewId());
        dto.setProductId(entity.getProduct().getProductId());
        dto.setUserId(entity.getUser().getId());
        dto.setUserName(entity.getUser().getName());
        dto.setRating(entity.getRating());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setHelpfulVotes(entity.getHelpfulVotes());
        dto.setHasUpvoted(currentUserId != null && entity.getUpvotedUserIds().contains(currentUserId));
        return dto;
    }
}
