package com.wellness.backend.service;

import com.wellness.backend.model.Booking;
import com.wellness.backend.repository.BookingRepository;
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

    private static final String ZONE_ID = "Asia/Kolkata";

    @Transactional
    public void scheduleSessionReminders(Booking booking) {
        if (booking.getSessionDate() == null || booking.getStartTime() == null) {
            log.warn("⚠️ Skipping reminder for session ID: {} — date/time is null.", booking.getId());
            return;
        }

        LocalDateTime sessionStart = LocalDateTime.of(booking.getSessionDate(), booking.getStartTime());
        LocalDateTime reminderTime = sessionStart.minusMinutes(30);
        long epochSeconds = calculateEpoch(reminderTime);

        log.info("🕐 Scheduling session reminder: ID={}, sessionStart={}, reminderTime={}, epoch={}",
                booking.getId(), sessionStart, reminderTime, epochSeconds);

        String clientSubject = "Session Reminder – Starts in 30 Minutes";
        String clientBody = String.format(
                "Dear %s,\n\nThis is a reminder that your session with Dr. %s starts in 30 minutes.",
                booking.getClient().getName(), booking.getProvider().getName());

        String providerSubject = "Upcoming Session in 30 Minutes";
        String providerBody = String.format(
                "Dear %s,\n\nYou have an upcoming session with %s starting in 30 minutes.",
                booking.getProvider().getName(), booking.getClient().getName());

        String clientMsgId = emailService.sendScheduledReminder(
                booking.getClient().getEmail(), clientSubject, clientBody, epochSeconds);
        log.info("📧 Patient reminder queued for session ID: {} — msgId={}",
                booking.getId(), clientMsgId != null ? clientMsgId : "FAILED");

        String providerMsgId = emailService.sendScheduledReminder(
                booking.getProvider().getEmail(), providerSubject, providerBody, epochSeconds);
        log.info("📧 Practitioner reminder queued for session ID: {} — msgId={}",
                booking.getId(), providerMsgId != null ? providerMsgId : "FAILED");

        if (clientMsgId != null || providerMsgId != null) {
            booking.setReminderSent(false); // Reset to allow poller to send in-app notifications
            bookingRepository.save(booking);
            log.info("✅ Session reminder persisted for session ID: {} at epoch {}", booking.getId(), epochSeconds);
        } else {
            log.error("❌ Both SendGrid calls failed for session ID: {} — no reminder was scheduled.", booking.getId());
        }
    }

    @Transactional
    public void cancelSessionReminders(Long sessionId) {
        bookingRepository.findById(sessionId).ifPresent(session -> {
            session.setReminderSent(true); // Treat as "sent" or "inactive" for poller
            bookingRepository.save(session);
            log.info("🚫 reminders cancelled/marked as inactive for session ID: {}", sessionId);
        });
    }

    private long calculateEpoch(LocalDateTime localTime) {
        long epoch = ZonedDateTime.of(localTime, ZoneId.of(ZONE_ID)).toEpochSecond();
        log.debug("🕰 Epoch for {} ({}) = {}", localTime, ZONE_ID, epoch);
        return epoch;
    }
}
