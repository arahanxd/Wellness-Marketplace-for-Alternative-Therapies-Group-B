package com.wellness.backend.service;

import com.wellness.backend.dto.SessionBookingRequestDTO;
import com.wellness.backend.dto.SessionBookingResponseDTO;
import com.wellness.backend.dto.SessionRescheduleRequestDTO;
import com.wellness.backend.dto.SessionStatusUpdateDTO;
import com.wellness.backend.exception.ForbiddenActionException;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.SessionBookingEntity;
import com.wellness.backend.model.SessionStatus;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.SessionBookingRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionBookingService {

    private final SessionBookingRepository sessionBookingRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Transactional
    public SessionBookingResponseDTO bookSession(String clientEmail, SessionBookingRequestDTO request) {
        UserEntity client = userRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found: " + clientEmail));

        UserEntity provider = userRepository.findById(request.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + request.getProviderId()));

        validateTimes(request.getSessionDate(), request.getStartTime(), request.getEndTime(), request.getDuration());

        SessionBookingEntity entity = new SessionBookingEntity();
        entity.setClient(client);
        entity.setProvider(provider);
        entity.setSessionDate(request.getSessionDate());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());

        int durationMinutes = (int) ChronoUnit.MINUTES
                .between(request.getStartTime(), request.getEndTime());
        entity.setDuration(durationMinutes);

        entity.setIssueDescription(request.getIssueDescription());
        entity.setStatus(SessionStatus.PENDING);
        entity.setReminderSent(false);

        if (entity.getStatus() == null) {
            entity.setStatus(SessionStatus.PENDING);
        }
        System.out.println("Saving session booking with status: " + entity.getStatus());

        SessionBookingEntity saved = sessionBookingRepository.save(entity);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionBookingResponseDTO> getSessionsForProvider(Long providerId) {
        return sessionBookingRepository.findByProvider_Id(providerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SessionBookingResponseDTO> getSessionsForClient(Long clientId) {
        return sessionBookingRepository.findByClient_Id(clientId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public SessionBookingResponseDTO acceptSession(Long sessionId, String providerEmail, SessionStatusUpdateDTO body) {
        SessionBookingEntity session = loadAndValidateProviderOwnership(sessionId, providerEmail);
        session.setStatus(SessionStatus.ACCEPTED);
        if (body != null && body.getProviderMessage() != null) {
            session.setProviderMessage(body.getProviderMessage());
        }
        SessionBookingEntity saved = sessionBookingRepository.save(session);
        notificationService.notifySessionConfirmedForClient(saved);
        return toDto(saved);
    }

    @Transactional
    public SessionBookingResponseDTO rescheduleSession(Long sessionId, String providerEmail,
            SessionRescheduleRequestDTO body) {
        SessionBookingEntity session = loadAndValidateProviderOwnership(sessionId, providerEmail);

        LocalDate newDate = body.getNewSessionDate() != null ? body.getNewSessionDate() : session.getSessionDate();
        LocalTime newStart = body.getNewStartTime() != null ? body.getNewStartTime() : session.getStartTime();
        LocalTime newEnd = body.getNewEndTime() != null ? body.getNewEndTime() : session.getEndTime();

        validateTimes(newDate, newStart, newEnd, null);

        session.setSessionDate(newDate);
        session.setStartTime(newStart);
        session.setEndTime(newEnd);
        session.setDuration((int) ChronoUnit.MINUTES.between(newStart, newEnd));
        session.setStatus(SessionStatus.RESCHEDULE_REQUESTED);
        session.setProviderMessage(body.getProviderMessage());
        session.setReminderSent(false);

        SessionBookingEntity saved = sessionBookingRepository.save(session);
        notificationService.notifySessionRescheduleSuggested(saved);
        return toDto(saved);
    }

    @Transactional
    public SessionBookingResponseDTO rejectSession(Long sessionId, String providerEmail, SessionStatusUpdateDTO body) {
        SessionBookingEntity session = loadAndValidateProviderOwnership(sessionId, providerEmail);
        session.setStatus(SessionStatus.REJECTED);
        if (body != null && body.getProviderMessage() != null) {
            session.setProviderMessage(body.getProviderMessage());
        }
        session.setReminderSent(false);
        SessionBookingEntity saved = sessionBookingRepository.save(session);
        notificationService.notifySessionRejectedForClient(saved);
        return toDto(saved);
    }

    @Transactional
    public SessionBookingResponseDTO confirmReschedule(Long sessionId, String clientEmail) {
        SessionBookingEntity session = sessionBookingRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (!session.getClient().getEmail().equalsIgnoreCase(clientEmail)) {
            throw new ForbiddenActionException("You are not allowed to confirm this session");
        }

        if (session.getStatus() != SessionStatus.RESCHEDULE_REQUESTED) {
            throw new IllegalStateException("Session is not awaiting reschedule confirmation");
        }

        session.setStatus(SessionStatus.ACCEPTED);
        session.setReminderSent(false);

        SessionBookingEntity saved = sessionBookingRepository.save(session);
        notificationService.notifySessionConfirmedForClient(saved);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SessionBookingResponseDTO> findUpcomingRemindersForUser(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        List<SessionBookingEntity> candidates = sessionBookingRepository
                .findByStatusAndReminderSentFalse(SessionStatus.ACCEPTED);

        return candidates.stream()
                .filter(s -> isOwner(user, s))
                .filter(this::isWithinNext30MinutesWindow)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void processSessionReminders() {
        LocalDateTime now = LocalDateTime.now();

        List<SessionBookingEntity> candidates = sessionBookingRepository
                .findByStatusAndReminderSentFalse(SessionStatus.ACCEPTED);

        for (SessionBookingEntity session : candidates) {
            if (isWithinExact30MinuteWindow(session, now)) {
                try {
                    sendReminderEmails(session);
                    notificationService.notifySessionReminder(session);
                    session.setReminderSent(true);
                    sessionBookingRepository.save(session);
                } catch (Exception e) {
                    // Log and continue with others; do not break scheduler
                    System.out.println("Failed to send reminder for session " + session.getId() + ": " + e.getMessage());
                }
            }
        }
    }

    private boolean isOwner(UserEntity user, SessionBookingEntity session) {
        Long uid = user.getId();
        return session.getClient().getId().equals(uid) || session.getProvider().getId().equals(uid);
    }

    private boolean isWithinNext30MinutesWindow(SessionBookingEntity session) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = LocalDateTime.of(session.getSessionDate(), session.getStartTime());
        LocalDateTime thirtyMinutesFromNow = now.plusMinutes(30);
        LocalDateTime thirtyFiveMinutesFromNow = now.plusMinutes(35);
        return (start.isAfter(thirtyMinutesFromNow.minusSeconds(1)) && start.isBefore(thirtyFiveMinutesFromNow));
    }

    private boolean isWithinExact30MinuteWindow(SessionBookingEntity session, LocalDateTime now) {
        LocalDateTime start = LocalDateTime.of(session.getSessionDate(), session.getStartTime());
        long minutesDiff = ChronoUnit.MINUTES.between(now, start);
        return minutesDiff >= 30 && minutesDiff < 35;
    }

    private void sendReminderEmails(SessionBookingEntity session) {
        emailService.sendSessionReminderToClient(session);
        emailService.sendSessionReminderToProvider(session);
    }

    private SessionBookingEntity loadAndValidateProviderOwnership(Long sessionId, String providerEmail) {
        SessionBookingEntity session = sessionBookingRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        if (!session.getProvider().getEmail().equalsIgnoreCase(providerEmail)) {
            throw new ForbiddenActionException("You are not allowed to modify this session");
        }

        return session;
    }

    private void validateTimes(LocalDate sessionDate, LocalTime start, LocalTime end, Integer duration) {
        if (end.isBefore(start) || end.equals(start)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (sessionDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Session date must not be in the past");
        }

        int computedDuration = (int) ChronoUnit.MINUTES.between(start, end);
        if (duration != null && !duration.equals(computedDuration)) {
            throw new IllegalArgumentException("Duration must match the difference between start and end time");
        }
    }

    private SessionBookingResponseDTO toDto(SessionBookingEntity entity) {
        return SessionBookingResponseDTO.builder()
                .id(entity.getId())
                .clientId(entity.getClient().getId())
                .clientName(entity.getClient().getName())
                .providerId(entity.getProvider().getId())
                .providerName(entity.getProvider().getName())
                .sessionDate(entity.getSessionDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .duration(entity.getDuration())
                .issueDescription(entity.getIssueDescription())
                .status(entity.getStatus())
                .providerMessage(entity.getProviderMessage())
                .reminderSent(entity.isReminderSent())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

