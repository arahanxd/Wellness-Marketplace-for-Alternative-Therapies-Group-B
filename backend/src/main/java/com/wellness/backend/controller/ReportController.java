package com.wellness.backend.controller;

import com.wellness.backend.dto.ReportDTO;
import com.wellness.backend.dto.ReportRequestDTO;
import com.wellness.backend.model.ReportEntityType;
import com.wellness.backend.model.ReportReason;
import com.wellness.backend.service.ReportService;
import com.wellness.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> report(@RequestBody ReportRequestDTO dto) {
        if (dto.getReason() == null || dto.getReason().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Reason is required"));
        }
        try {
            Long userId = dto.getReporterId() != null ? dto.getReporterId() : getCurrentUserId();
            ReportEntityType type = ReportEntityType.valueOf(dto.getEntityType().toUpperCase());
            ReportReason reason = ReportReason.valueOf(dto.getReason().toUpperCase());
            ReportDTO report = reportService.createReport(userId, dto.getReportedEntityId(), type, reason, dto.getComment());
            return ResponseEntity.status(201).body(Map.of("message", "Content reported successfully", "report", report));
        } catch (IllegalArgumentException | NullPointerException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid entity type or reason: " + dto.getEntityType() + " / " + dto.getReason()));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    private Long getCurrentUserId() {
        String email = "";
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal != null) {
            email = principal.toString();
        } else {
            throw new RuntimeException("No authenticated user found");
        }
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"))
                .getId();
    }
}
