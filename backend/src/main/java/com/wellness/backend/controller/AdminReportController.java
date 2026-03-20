package com.wellness.backend.controller;

import com.wellness.backend.dto.ReportDTO;
import com.wellness.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AdminReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<List<ReportDTO>> getAllReports() {
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PostMapping("/{reportId}/resolve")
    public ResponseEntity<?> resolveReport(@PathVariable Long reportId, @RequestParam String action) {
        reportService.resolveReport(reportId, action);
        return ResponseEntity.ok(Map.of("message", "Report resolved with action: " + action));
    }
}
