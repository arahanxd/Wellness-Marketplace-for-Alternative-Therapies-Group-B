package com.wellness.backend.service;

import com.wellness.backend.dto.PractitionerReviewDTO;
import com.wellness.backend.dto.StarRatingDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.Booking;
import com.wellness.backend.model.PractitionerReviewEntity;
import com.wellness.backend.model.SessionStatus;
import com.wellness.backend.repository.BookingRepository;
import com.wellness.backend.repository.PractitionerReviewRepository;
import com.wellness.backend.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PractitionerReviewService {

    private final PractitionerReviewRepository reviewRepository;
    private final ProductReviewRepository productReviewRepository;
    private final BookingRepository bookingRepository;

    public PractitionerReviewDTO addReview(PractitionerReviewDTO dto) {
        Booking booking = bookingRepository.findById(dto.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + dto.getBookingId()));

        // Restriction Check: Must be COMPLETED
        if (booking.getStatus() != SessionStatus.COMPLETED) {
            throw new IllegalStateException("Only completed sessions can be rated.");
        }

        // Prevent duplicate reviews
        if (reviewRepository.existsByBooking_Id(dto.getBookingId())) {
            throw new IllegalStateException("You have already rated this session.");
        }

        PractitionerReviewEntity review = PractitionerReviewEntity.builder()
                .client(booking.getClient())
                .provider(booking.getProvider())
                .booking(booking)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        PractitionerReviewEntity saved = reviewRepository.save(review);
        return mapToDTO(saved);
    }

    public List<PractitionerReviewDTO> getPractitionerReviews(Long providerId) {
        return reviewRepository.findByProvider_Id(providerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public StarRatingDTO getPractitionerStarBreakdown(Long providerId) {
        List<Object[]> rawCounts = reviewRepository.countRatingsByProviderGroupId(providerId);
        return convertToStarRatingDTO(rawCounts);
    }

    public StarRatingDTO getProductStarBreakdown(Long providerId) {
        List<Object[]> rawCounts = productReviewRepository.countProductRatingsByProviderGroupId(providerId, Arrays.asList("REMOVED", "BLOCKED"));
        return convertToStarRatingDTO(rawCounts);
    }

    private StarRatingDTO convertToStarRatingDTO(List<Object[]> rawCounts) {
        Map<Integer, Long> countMap = rawCounts.stream()
                .collect(Collectors.toMap(
                        row -> (Integer) row[0],
                        row -> (Long) row[1]
                ));

        long total = countMap.values().stream().mapToLong(Long::longValue).sum();

        return StarRatingDTO.builder()
                .oneStar(countMap.getOrDefault(1, 0L))
                .twoStar(countMap.getOrDefault(2, 0L))
                .threeStar(countMap.getOrDefault(3, 0L))
                .fourStar(countMap.getOrDefault(4, 0L))
                .fiveStar(countMap.getOrDefault(5, 0L))
                .totalReviews(total)
                .build();
    }

    private PractitionerReviewDTO mapToDTO(PractitionerReviewEntity entity) {
        return PractitionerReviewDTO.builder()
                .id(entity.getId())
                .clientId(entity.getClient().getId())
                .clientName(entity.getClient().getName())
                .providerId(entity.getProvider().getId())
                .providerName(entity.getProvider().getName())
                .bookingId(entity.getBooking().getId())
                .rating(entity.getRating())
                .comment(entity.getComment())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
