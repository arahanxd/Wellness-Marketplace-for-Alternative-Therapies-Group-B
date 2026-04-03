package com.wellness.backend.scheduler;

import com.wellness.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeliveryNotificationScheduler {

    private final OrderService orderService;

    /**
     * Runs every day at 9:00 AM to send delivery notifications to users.
     * Cron expression: "0 0 9 * * ?" (second, minute, hour, day, month, day-of-week)
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void runDeliveryNotifications() {
        log.info("🚚 Delivery Notification Scheduler started...");
        try {
            orderService.processDeliveryNotifications();
            log.info("✅ Delivery Notification Scheduler finished successfully.");
        } catch (Exception e) {
            log.error("❌ Error during delivery notification processing", e);
        }
    }

    /**
     * Optional: A secondary run at 2:00 PM just in case (optional, but keep it for robustness)
     */
    @Scheduled(cron = "0 0 14 * * ?")
    public void runSecondaryDeliveryNotifications() {
        log.info("🚚 Secondary Delivery Notification Scheduler started...");
        try {
            orderService.processDeliveryNotifications();
            log.info("✅ Secondary Delivery Notification Scheduler finished.");
        } catch (Exception e) {
            log.error("❌ Error during secondary delivery notification processing", e);
        }
    }
}
