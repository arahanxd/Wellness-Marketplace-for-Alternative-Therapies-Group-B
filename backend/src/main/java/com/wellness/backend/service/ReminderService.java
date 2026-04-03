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

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sessionStart = LocalDateTime.of(booking.getSessionDate(), booking.getStartTime());
        LocalDateTime reminderTime = sessionStart.minusMinutes(30);

        // SendGrid limit: can't schedule more than 72 hours in advance
        if (reminderTime.isAfter(now.plusHours(72))) {
            log.info("⏳ Session ID: {} is too far in future (>72h). Will be scheduled by periodic task later.", booking.getId());
            return;
        }

        String clientSubject = "Session Reminder – Starts in 30 Minutes";
        String clientBody = String.format(
                "Dear %s,\n\nThis is a reminder that your session with Dr. %s starts in 30 minutes.",
                booking.getClient().getName(), booking.getProvider().getName());

        String providerSubject = "Upcoming Session in 30 Minutes";
        String providerBody = String.format(
                "Dear %s,\n\nYou have an upcoming session with %s starting in 30 minutes.",
                booking.getProvider().getName(), booking.getClient().getName());

        String clientMsgId;
        String providerMsgId;

        if (reminderTime.isBefore(now.plusMinutes(5))) {
            log.info("📧 Session ID: {} starts soon or already passed 30m mark. Sending reminders immediately.", booking.getId());
            emailService.sendImmediateSendGridEmail(booking.getClient().getEmail(), clientSubject, clientBody);
            emailService.sendImmediateSendGridEmail(booking.getProvider().getEmail(), providerSubject, providerBody);
            clientMsgId = "SENT_IMMEDIATE";
            providerMsgId = "SENT_IMMEDIATE";
        } else {
            long epochSeconds = calculateEpoch(reminderTime);
            log.info("🕐 Scheduling session reminder: ID={}, sessionStart={}, reminderTime={}, epoch={}",
                    booking.getId(), sessionStart, reminderTime, epochSeconds);
            
            clientMsgId = emailService.sendScheduledReminder(
                    booking.getClient().getEmail(), clientSubject, clientBody, epochSeconds);
            providerMsgId = emailService.sendScheduledReminder(
                    booking.getProvider().getEmail(), providerSubject, providerBody, epochSeconds);
        }

        if (clientMsgId != null || providerMsgId != null) {
            booking.setReminderSent(true); 
            bookingRepository.save(booking);
            log.info("✅ Session reminder status updated for session ID: {}", booking.getId());
        } else {
            log.error("❌ Email delivery failed for session ID: {} — no reminder was sent/scheduled.", booking.getId());
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
