package com.wellness.backend.controller;

import com.wellness.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class TestNotificationController {

    private final OrderService orderService;

    @PostMapping("/trigger-delivery-notifications")
    public String triggerNotifications() {
        try {
            orderService.processDeliveryNotifications();
            return "✅ Delivery notification process triggered successfully. Check logs for details.";
        } catch (Exception e) {
            return "❌ Error triggering notifications: " + e.getMessage();
        }
    }
}
