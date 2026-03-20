package com.wellness.backend.controller;

import com.wellness.backend.model.WeeklyAvailabilityEntity;
import com.wellness.backend.service.WeeklyAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/availability/weekly")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class WeeklyAvailabilityController {

    private final WeeklyAvailabilityService weeklyAvailabilityService;

    @GetMapping("/{providerId}")
    public ResponseEntity<List<WeeklyAvailabilityEntity>> getWeeklyAvailability(@PathVariable Long providerId) {
        return ResponseEntity.ok(weeklyAvailabilityService.getWeeklyAvailability(providerId));
    }

    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<WeeklyAvailabilityEntity> addSlot(Principal principal,
            @RequestBody Map<String, String> data) {
        DayOfWeek day = DayOfWeek.valueOf(data.get("dayOfWeek").toUpperCase());
        LocalTime start = LocalTime.parse(data.get("startTime"));
        LocalTime end = LocalTime.parse(data.get("endTime"));
        return ResponseEntity.ok(weeklyAvailabilityService.addOrUpdateSlot(principal.getName(), day, start, end));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id, Principal principal) {
        weeklyAvailabilityService.deleteSlot(id, principal.getName());
        return ResponseEntity.ok().build();
    }
}
