package com.wellness.backend.service;

import com.wellness.backend.model.BookingEntity;
import com.wellness.backend.model.SessionBookingEntity;
import com.wellness.backend.repository.BookingRepository;
import com.wellness.backend.repository.SessionBookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReminderService {

    private final EmailService emailService;
    private final BookingRepository bookingRepository;
    private final SessionBookingRepository sessionBookingRepository;

    private static final String ZONE_ID = "Asia/Kolkata";

    @Transactional
    public void scheduleBookingReminders(BookingEntity booking) {
        if (booking.getBookingDate() == null)
            return;

        LocalDateTime sessionStart = booking.getBookingDate();
        LocalDateTime reminderTime = sessionStart.minusMinutes(30);

        // Fix Timezone: Convert local time to epoch seconds using the correct zone
        long epochSeconds = calculateEpoch(reminderTime);

        String clientSubject = "Notification: Session Reminder – Starts in 30 Minutes";
        String clientBody = String.format(
                "Dear %s,\n\nThis is a reminder that your session with %s starts in 30 minutes.",
                booking.getUser().getName(), booking.getPractitioner().getName());

        String practitionerSubject = "Notification: Upcoming Session in 30 Minutes";
        String practitionerBody = String.format(
                "Dear %s,\n\nThis is a reminder that you have a session with %s starting in 30 minutes.",
                booking.getPractitioner().getName(), booking.getUser().getName());

        // Schedule for patient
        emailService.sendScheduledReminder(booking.getUser().getEmail(), clientSubject, clientBody, epochSeconds);

        // Schedule for practitioner
        String messageId = emailService.sendScheduledReminder(booking.getPractitioner().getEmail(), practitionerSubject,
                practitionerBody, epochSeconds);

        if (messageId != null) {
            booking.setReminderScheduled(true);
            booking.setReminderScheduledAt(reminderTime);
            booking.setProviderMessageId(messageId);
            bookingRepository.save(booking);
            log.info("✅ Persistent reminder scheduled for booking ID: {} at epoch {}", booking.getId(), epochSeconds);
        }
    }

    @Transactional
    public void scheduleSessionReminders(SessionBookingEntity session) {
        if (session.getSessionDate() == null || session.getStartTime() == null)
            return;

        LocalDateTime sessionStart = LocalDateTime.of(session.getSessionDate(), session.getStartTime());
        LocalDateTime reminderTime = sessionStart.minusMinutes(30);

        long epochSeconds = calculateEpoch(reminderTime);

        String clientSubject = "Session Reminder – Starts in 30 Minutes";
        String clientBody = String.format(
                "Dear %s,\n\nThis is a reminder that your session with Dr. %s starts in 30 minutes.",
                session.getClient().getName(), session.getProvider().getName());

        String providerSubject = "Upcoming Session in 30 Minutes";
        String providerBody = String.format("Dear %s,\n\nYou have an upcoming session with %s starting in 30 minutes.",
                session.getProvider().getName(), session.getClient().getName());

        emailService.sendScheduledReminder(session.getClient().getEmail(), clientSubject, clientBody, epochSeconds);
        emailService.sendScheduledReminder(session.getProvider().getEmail(), providerSubject, providerBody,
                epochSeconds);

        session.setReminderSent(false); // Reset to allow poller to send in-app notifications if needed
        sessionBookingRepository.save(session);
        log.info("✅ Persistent reminder scheduled for smart session ID: {} at epoch {}", session.getId(), epochSeconds);
    }

    @Transactional
    public void cancelBookingReminders(Long bookingId) {
        bookingRepository.findById(bookingId).ifPresent(booking -> {
            booking.setReminderScheduled(false);
            bookingRepository.save(booking);
            log.info("🚫 reminders cancelled/marked as inactive for booking ID: {}", bookingId);
        });
    }

    @Transactional
    public void cancelSessionReminders(Long sessionId) {
        sessionBookingRepository.findById(sessionId).ifPresent(session -> {
            session.setReminderSent(true); // Treat as "sent" or "inactive" for poller
            sessionBookingRepository.save(session);
            log.info("🚫 reminders cancelled/marked as inactive for session ID: {}", sessionId);
        });
    }

    private long calculateEpoch(LocalDateTime localTime) {
        // Correctly handle the timezone offset
        return ZonedDateTime.of(localTime, ZoneId.of(ZONE_ID)).toEpochSecond();
    }
}
