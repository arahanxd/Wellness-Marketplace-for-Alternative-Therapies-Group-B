package com.wellness.backend.service;

import com.wellness.backend.dto.*;
import com.wellness.backend.model.SessionStatus;
import com.wellness.backend.repository.BookingRepository;
import com.wellness.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final OrderRepository orderRepository;
    private final com.wellness.backend.service.PractitionerReviewService practitionerReviewService;

    public PractitionerAnalyticsDTO getPractitionerAnalytics(Long practitionerId) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate prevWeekStart = weekStart.minusWeeks(1);
        LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate prevMonthStart = monthStart.minusMonths(1);
        LocalDate yearStart = today.with(TemporalAdjusters.firstDayOfYear());
        LocalDate prevYearStart = yearStart.minusYears(1);

        // Daily
        BigDecimal sessionToday = orZero(bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, today, today));
        BigDecimal productToday = orZero(orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, today.atStartOfDay(), today.plusDays(1).atStartOfDay()));
        BigDecimal totalToday = sessionToday.add(productToday);

        BigDecimal sessionYesterday = orZero(bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, yesterday, yesterday));
        BigDecimal productYesterday = orZero(orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, yesterday.atStartOfDay(), today.atStartOfDay()));
        BigDecimal totalYesterday = sessionYesterday.add(productYesterday);

        // Weekly
        BigDecimal sessionThisWeek = orZero(bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, weekStart, today));
        BigDecimal productThisWeek = orZero(orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, weekStart.atStartOfDay(), today.plusDays(1).atStartOfDay()));
        BigDecimal totalThisWeek = sessionThisWeek.add(productThisWeek);

        BigDecimal sessionPrevWeek = orZero(bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, prevWeekStart, weekStart.minusDays(1)));
        BigDecimal productPrevWeek = orZero(orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, prevWeekStart.atStartOfDay(), weekStart.atStartOfDay()));
        BigDecimal totalPrevWeek = sessionPrevWeek.add(productPrevWeek);

        // Monthly
        BigDecimal sessionThisMonth = orZero(bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, monthStart, today));
        BigDecimal productThisMonth = orZero(orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, monthStart.atStartOfDay(), today.plusDays(1).atStartOfDay()));
        BigDecimal totalThisMonth = sessionThisMonth.add(productThisMonth);

        BigDecimal sessionPrevMonth = orZero(bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, prevMonthStart, monthStart.minusDays(1)));
        BigDecimal productPrevMonth = orZero(orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, prevMonthStart.atStartOfDay(), monthStart.atStartOfDay()));
        BigDecimal totalPrevMonth = sessionPrevMonth.add(productPrevMonth);

        // Yearly
        BigDecimal sessionThisYear = orZero(bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, yearStart, today));
        BigDecimal productThisYear = orZero(orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, yearStart.atStartOfDay(), today.plusDays(1).atStartOfDay()));
        BigDecimal totalThisYear = sessionThisYear.add(productThisYear);

        BigDecimal sessionPrevYear = orZero(bookingRepository.sumSessionRevenueByPractitionerAndDateRange(practitionerId, prevYearStart, yearStart.minusDays(1)));
        BigDecimal productPrevYear = orZero(orderRepository.sumProductRevenueByProviderAndDateRange(practitionerId, prevYearStart.atStartOfDay(), yearStart.atStartOfDay()));
        BigDecimal totalPrevYear = sessionPrevYear.add(productPrevYear);

        // All Time
        BigDecimal totalSessionAllTime = orZero(bookingRepository.sumTotalSessionRevenueByPractitioner(practitionerId));
        BigDecimal totalProductAllTime = orZero(orderRepository.sumTotalProductRevenueByProvider(practitionerId));
        BigDecimal totalAllTime = totalSessionAllTime.add(totalProductAllTime);

        return PractitionerAnalyticsDTO.builder()
                .dailyRevenue(totalToday)
                .weeklyRevenue(totalThisWeek)
                .monthlyRevenue(totalThisMonth)
                .yearlyRevenue(totalThisYear)
                .allTimeRevenue(totalAllTime)
                .dailyGrowthPercent(calculateGrowth(totalToday, totalYesterday))
                .weeklyGrowthPercent(calculateGrowth(totalThisWeek, totalPrevWeek))
                .monthlyGrowthPercent(calculateGrowth(totalThisMonth, totalPrevMonth))
                .yearlyGrowthPercent(calculateGrowth(totalThisYear, totalPrevYear))
                .sessionRevenueDaily(sessionToday)
                .productRevenueDaily(productToday)
                .sessionRevenueMonthly(sessionThisMonth)
                .productRevenueMonthly(productThisMonth)
                .sessionRevenueAllTime(totalSessionAllTime)
                .productRevenueAllTime(totalProductAllTime)
                .totalSessionRevenue(totalSessionAllTime)
                .totalProductRevenue(totalProductAllTime)
                .accumulatedRevenue(totalAllTime)
                .productStarBreakdown(practitionerReviewService.getProductStarBreakdown(practitionerId))
                .practitionerStarBreakdown(practitionerReviewService.getPractitionerStarBreakdown(practitionerId))
                .build();
    }

    public PatientAnalyticsDTO getPatientAnalytics(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate monthStart = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate yearStart = today.with(TemporalAdjusters.firstDayOfYear());

        long sessionsAttended = bookingRepository.countByClient_IdAndStatusIn(userId, 
                List.of(SessionStatus.ACCEPTED, SessionStatus.CONFIRMED, SessionStatus.COMPLETED, SessionStatus.PENDING_COMPLETION_ACTION));

        BigDecimal totalSessionSpent = orZero(bookingRepository.sumTotalSessionSpentByPatient(userId));
        BigDecimal totalProductSpent = orZero(orderRepository.sumTotalProductSpentByPatient(userId));
        BigDecimal totalSpent = totalSessionSpent.add(totalProductSpent);

        BigDecimal monthlySpent = orZero(bookingRepository.sumSessionSpentByPatientAndDateRange(userId, monthStart, today))
                .add(orZero(orderRepository.sumProductSpentByPatientAndDateRange(userId, monthStart.atStartOfDay(), today.plusDays(1).atStartOfDay())));

        BigDecimal yearlySpent = orZero(bookingRepository.sumSessionSpentByPatientAndDateRange(userId, yearStart, today))
                .add(orZero(orderRepository.sumProductSpentByPatientAndDateRange(userId, yearStart.atStartOfDay(), today.plusDays(1).atStartOfDay())));

        List<BookingResponseDTO> recentSessions = bookingRepository.findRecentSessionsByClient(userId, PageRequest.of(0, 5))
                .stream().map(this::toDto).collect(Collectors.toList());

        List<OrderDTO> recentOrders = orderRepository.findTop5ByUser_IdOrderByOrderDateDesc(userId)
                .stream().map(this::mapToOrderDTO).collect(Collectors.toList());

        return PatientAnalyticsDTO.builder()
                .sessionsAttended(sessionsAttended)
                .totalSessionSpent(totalSessionSpent)
                .totalProductSpent(totalProductSpent)
                .totalSpent(totalSpent)
                .monthlySpent(monthlySpent)
                .yearlySpent(yearlySpent)
                .recentSessions(recentSessions)
                .recentOrders(recentOrders)
                .build();
    }

    private BigDecimal orZero(BigDecimal val) {
        return val == null ? BigDecimal.ZERO : val;
    }

    private Double calculateGrowth(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private BookingResponseDTO toDto(com.wellness.backend.model.Booking entity) {
        String profileImg = entity.getProvider().getProfileImage();
        if (profileImg != null && !profileImg.startsWith("http")) profileImg = "http://localhost:8080/uploads/" + profileImg;
        return BookingResponseDTO.builder()
                .id(entity.getId()).clientId(entity.getClient().getId()).clientName(entity.getClient().getName()).clientEmail(entity.getClient().getEmail())
                .providerId(entity.getProvider().getId()).providerName(entity.getProvider().getName()).providerSpecialization(entity.getProvider().getSpecialization()).providerProfileImage(profileImg)
                .sessionDate(entity.getSessionDate()).startTime(entity.getStartTime()).endTime(entity.getEndTime()).duration(entity.getDuration())
                .description(entity.getIssueDescription()).status(entity.getStatus()).providerMessage(entity.getProviderMessage())
                .reminderSent(entity.isReminderSent()).refunded(entity.isRefunded()).createdAt(entity.getCreatedAt()).updatedAt(entity.getUpdatedAt())
                .sessionFee(entity.getProvider().getSessionFee()).build();
    }

    private OrderDTO mapToOrderDTO(com.wellness.backend.model.OrderEntity o) {
        OrderDTO dto = new OrderDTO();
        dto.setOrderId(o.getOrderId());
        dto.setName(o.getProduct().getName());
        dto.setProductImage(o.getProduct().getImageUrl());
        dto.setPrice(o.getProduct().getPrice().doubleValue());
        dto.setQuantity(o.getQuantity());
        dto.setTotalAmount(o.getTotalPrice().doubleValue());
        dto.setOrderDate(o.getOrderDate());
        dto.setDeliveryStatus(o.getDeliveryStatus());
        return dto;
    }
}
