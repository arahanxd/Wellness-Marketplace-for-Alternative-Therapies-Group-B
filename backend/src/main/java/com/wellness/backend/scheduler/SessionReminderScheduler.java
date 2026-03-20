package com.wellness.backend.scheduler;

import com.wellness.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SessionReminderScheduler {

    private final BookingService bookingService;

    // Runs every 1 minute
    @Scheduled(fixedRate = 60_000)
    public void runSessionReminders() {
        log.info("⏰ Session Reminder Scheduler started...");
        try {
            bookingService.processSessionReminders();

            // Auto-complete sessions that have passed
            bookingService.autoProcessSessionCompletion();
        } catch (Exception e) {
            log.error("❌ Error during session reminder/completion processing", e);
        }
        log.info("✅ Session Reminder Scheduler finished.");
    }
}
