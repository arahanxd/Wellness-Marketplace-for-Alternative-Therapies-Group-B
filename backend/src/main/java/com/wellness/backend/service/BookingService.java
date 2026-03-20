package com.wellness.backend.service;

import com.wellness.backend.dto.BookingRequestDTO;
import com.wellness.backend.dto.BookingResponseDTO;
import com.wellness.backend.dto.SessionRescheduleRequestDTO;
import com.wellness.backend.dto.SessionStatusUpdateDTO;
import com.wellness.backend.exception.ForbiddenActionException;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.Booking;
import com.wellness.backend.model.SessionStatus;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.BookingRepository;
import com.wellness.backend.repository.ProviderAvailabilityRepository;
import com.wellness.backend.repository.UserRepository;
import com.wellness.backend.repository.WeeklyAvailabilityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ProviderAvailabilityRepository providerAvailabilityRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final ReminderService reminderService;
    private final WeeklyAvailabilityRepository weeklyAvailabilityRepository;

    @Transactional
    public BookingResponseDTO bookSession(String clientEmail, BookingRequestDTO request) {
        UserEntity client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientEmail));

        UserEntity provider = userRepository.findById(request.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + request.getProviderId()));

        validateTimes(request.getSessionDate(), request.getStartTime(), request.getEndTime(), request.getDuration());

        // Availability check
        long totalDateSpecificSlots = providerAvailabilityRepository.findByProvider_Id(provider.getId()).size();
        long totalWeeklySlots = weeklyAvailabilityRepository.findByProvider_Id(provider.getId()).size();

        if (totalDateSpecificSlots > 0 || totalWeeklySlots > 0) {
            boolean dateSpecificCovered = providerAvailabilityRepository.findCoveringSlot(
                    provider.getId(), request.getSessionDate(), request.getStartTime(), request.getEndTime()).isPresent();

            if (!dateSpecificCovered) {
                java.time.DayOfWeek day = request.getSessionDate().getDayOfWeek();
                boolean weeklyCovered = weeklyAvailabilityRepository
                        .findByProvider_IdAndDayOfWeekAndIsEnabledTrue(provider.getId(), day).stream()
                        .anyMatch(s -> (s.getStartTime().isBefore(request.getStartTime()) || s.getStartTime().equals(request.getStartTime())) &&
                                (s.getEndTime().isAfter(request.getEndTime()) || s.getEndTime().equals(request.getEndTime())));

                if (!weeklyCovered) {
                    throw new com.wellness.backend.exception.BookingConflictException("Outside practitioner's availability.");
                }
            }
        }

        if (bookingRepository.hasConflictingConfirmedSession(provider.getId(), request.getSessionDate(), request.getStartTime())) {
            throw new com.wellness.backend.exception.BookingConflictException("This time slot is already booked and confirmed.");
        }

        Booking entity = new Booking();
        entity.setClient(client);
        entity.setProvider(provider);
        entity.setSessionDate(request.getSessionDate());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setDuration(request.getDuration() != null ? request.getDuration() : (int) ChronoUnit.MINUTES.between(request.getStartTime(), request.getEndTime()));
        entity.setIssueDescription(request.getDescription());
        entity.setStatus(SessionStatus.PENDING);
        entity.setReminderSent(false);

        Booking saved = bookingRepository.save(entity);
        log.info("📅 New booking created (PENDING) ID: {}", saved.getId());
        return toDto(saved);
    }

    @Transactional
    public BookingResponseDTO acceptBooking(Long id) {
        String loggedInUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity loggedInUser = userRepository.findByEmail(loggedInUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Logged in user not found"));

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        log.info("DEBUG: bookingId={}, booking.providerId={}, loggedInUser.id={}", 
                 id, booking.getProvider().getId(), loggedInUser.getId());

        if (!booking.getProvider().getId().equals(loggedInUser.getId())) {
            throw new ForbiddenActionException("Unauthorized: You are not the provider for this booking");
        }

        booking.setStatus(SessionStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);
        
        notificationService.notifySessionConfirmedForClient(saved);
        reminderService.scheduleSessionReminders(saved);
        
        return toDto(saved);
    }

    @Transactional
    public BookingResponseDTO rescheduleBooking(Long id, String providerEmail, SessionRescheduleRequestDTO body) {
        Booking booking = loadAndValidateProviderOwnership(id, providerEmail);
        LocalDate newDate = body.getNewSessionDate() != null ? body.getNewSessionDate() : booking.getSessionDate();
        LocalTime newStart = body.getNewStartTime() != null ? body.getNewStartTime() : booking.getStartTime();
        LocalTime newEnd = body.getNewEndTime() != null ? body.getNewEndTime() : booking.getEndTime();

        validateTimes(newDate, newStart, newEnd, null);
        booking.setSessionDate(newDate);
        booking.setStartTime(newStart);
        booking.setEndTime(newEnd);
        booking.setDuration((int) ChronoUnit.MINUTES.between(newStart, newEnd));
        booking.setStatus(SessionStatus.RESCHEDULE_REQUESTED);
        booking.setProviderMessage(body.getProviderMessage());
        booking.setReminderSent(false);

        Booking saved = bookingRepository.save(booking);
        notificationService.notifySessionRescheduleSuggested(saved);
        return toDto(saved);
    }

    @Transactional
    public BookingResponseDTO rejectBooking(Long id, String providerEmail) {
        Booking booking = loadAndValidateProviderOwnership(id, providerEmail);
        booking.setStatus(SessionStatus.REJECTED);
        Booking saved = bookingRepository.save(booking);
        notificationService.notifySessionRejectedForClient(saved);
        reminderService.cancelSessionReminders(saved.getId());
        return toDto(saved);
    }

    @Transactional
    public BookingResponseDTO cancelBooking(Long id, String userEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        if (!booking.getClient().getId().equals(user.getId()) && !booking.getProvider().getId().equals(user.getId())) {
            throw new ForbiddenActionException("Unauthorized cancellation");
        }

        booking.setStatus(SessionStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        try {
            notificationService.notifySessionCancelled(saved, user);
            emailService.sendSessionCancelledEmail(saved, user);
            reminderService.cancelSessionReminders(saved.getId());
        } catch (Exception e) {
            log.error("Failed notification for cancellation: {}", e.getMessage());
        }
        return toDto(saved);
    }

    @Transactional
    public BookingResponseDTO confirmReschedule(Long id, String clientEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getClient().getEmail().equalsIgnoreCase(clientEmail)) {
            throw new ForbiddenActionException("Unauthorized confirmation");
        }
        if (booking.getStatus() != SessionStatus.RESCHEDULE_REQUESTED) {
            throw new IllegalStateException("Not in reschedule requested state");
        }
        booking.setStatus(SessionStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);
        notificationService.notifySessionConfirmedForClient(saved);
        reminderService.scheduleSessionReminders(saved);
        return toDto(saved);
    }

    @Transactional
    public BookingResponseDTO completeBooking(Long id, String providerEmail) {
        Booking booking = loadAndValidateProviderOwnership(id, providerEmail);
        booking.setStatus(SessionStatus.COMPLETED);
        Booking saved = bookingRepository.save(booking);
        notificationService.notifySessionCompleted(saved);
        try { emailService.sendSessionCompletedEmail(saved); } catch (Exception ignored) {}
        updateDateConsistency(saved.getSessionDate(), saved.getProvider().getId());
        return toDto(saved);
    }

    @Transactional
    public BookingResponseDTO markNotCompleted(Long id, String providerEmail) {
        Booking booking = loadAndValidateProviderOwnership(id, providerEmail);
        booking.setStatus(SessionStatus.NOT_COMPLETED);
        booking.setRefunded(true);
        Booking saved = bookingRepository.save(booking);
        notificationService.notifySessionNotCompleted(saved);
        try { emailService.sendSessionNotCompletedEmail(saved); } catch (Exception ignored) {}
        updateDateConsistency(saved.getSessionDate(), saved.getProvider().getId());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getSessionsForProvider(Long providerId) {
        LocalDateTime now = LocalDateTime.now();
        List<SessionStatus> excluded = List.of(SessionStatus.COMPLETED, SessionStatus.NOT_COMPLETED);
        return bookingRepository.findUpcomingSessionsForProvider(providerId, now.toLocalDate(), now.toLocalTime(), excluded).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getSessionsForClient(Long clientId) {
        LocalDateTime now = LocalDateTime.now();
        List<SessionStatus> excluded = List.of(SessionStatus.COMPLETED, SessionStatus.NOT_COMPLETED);
        return bookingRepository.findUpcomingSessionsForClient(clientId, now.toLocalDate(), now.toLocalTime(), excluded).stream()
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getSessionsHistoryForProvider(Long providerId) {
        return bookingRepository.findByProvider_Id(providerId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getSessionsHistoryForClient(Long clientId) {
        return bookingRepository.findByClient_Id(clientId).stream().map(this::toDto).collect(Collectors.toList());
    }

    private Booking loadAndValidateProviderOwnership(Long id, String providerEmail) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        if (!booking.getProvider().getEmail().equalsIgnoreCase(providerEmail)) {
            throw new ForbiddenActionException("Unauthorized access");
        }
        return booking;
    }

    private void validateTimes(LocalDate date, LocalTime start, LocalTime end, Integer duration) {
        if (end.isBefore(start) || end.equals(start)) throw new IllegalArgumentException("Invalid times");
        if (date.isBefore(LocalDate.now())) throw new IllegalArgumentException("Date in past");
    }

    private void updateDateConsistency(LocalDate date, Long providerId) {
        List<Booking> sessions = bookingRepository.findByProvider_IdAndSessionDate(providerId, date);
        if (sessions.isEmpty()) return;
        boolean anyNotCompleted = sessions.stream().anyMatch(s -> s.getStatus() == SessionStatus.NOT_COMPLETED);
        boolean allCompleted = sessions.stream().allMatch(s -> s.getStatus() == SessionStatus.COMPLETED);
        String status = anyNotCompleted ? "YELLOW" : (allCompleted ? "GREEN" : null);
        providerAvailabilityRepository.findByProviderIdAndAvailableDate(providerId, date).forEach(slot -> {
            slot.setDateStatus(status);
            providerAvailabilityRepository.save(slot);
        });
    }

    @Transactional
    public void processSessionReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime reminderWindowEnd = now.plusMinutes(45);
        
        List<Booking> upcoming = bookingRepository.findByStatusInAndReminderSentFalse(
                List.of(SessionStatus.ACCEPTED, SessionStatus.CONFIRMED));
        
        for (Booking booking : upcoming) {
            LocalDateTime start = LocalDateTime.of(booking.getSessionDate(), booking.getStartTime());
            if (start.isAfter(now) && start.isBefore(reminderWindowEnd)) {
                log.info("⏰ Triggering reminder for session ID: {}", booking.getId());
                reminderService.scheduleSessionReminders(booking);
                booking.setReminderSent(true);
                bookingRepository.save(booking);
            }
        }
    }

    @Transactional
    public void autoProcessSessionCompletion() {
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();
        
        List<Booking> stale = bookingRepository.findStaleConfirmedSessions(today, nowTime);
        for (Booking booking : stale) {
            log.info("🏁 Marking session ID: {} as PENDING_COMPLETION_ACTION", booking.getId());
            booking.setStatus(SessionStatus.PENDING_COMPLETION_ACTION);
            bookingRepository.save(booking);
        }
    }

    public BookingResponseDTO toDto(Booking entity) {
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
}
