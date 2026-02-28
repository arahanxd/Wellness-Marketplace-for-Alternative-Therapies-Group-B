package com.wellness.backend.scheduler;

import com.wellness.backend.service.SessionBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SessionReminderScheduler {

    private final SessionBookingService sessionBookingService;

    // Runs every 5 minutes
    @Scheduled(fixedRate = 300_000)
    public void runSessionReminders() {
        sessionBookingService.processSessionReminders();
    }
}

