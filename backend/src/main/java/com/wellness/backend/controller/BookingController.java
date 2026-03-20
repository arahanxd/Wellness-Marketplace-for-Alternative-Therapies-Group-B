package com.wellness.backend.controller;

import com.wellness.backend.dto.BookingRequestDTO;
import com.wellness.backend.dto.BookingResponseDTO;
import com.wellness.backend.dto.SessionRescheduleRequestDTO;
import com.wellness.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/book")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<BookingResponseDTO> bookSession(
            Principal principal,
            @Valid @RequestBody BookingRequestDTO request) {
        return ResponseEntity.ok(bookingService.bookSession(principal.getName(), request));
    }

    @GetMapping("/provider/{providerId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<BookingResponseDTO>> getSessionsForProvider(@PathVariable Long providerId) {
        return ResponseEntity.ok(bookingService.getSessionsForProvider(providerId));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<List<BookingResponseDTO>> getSessionsForClient(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getSessionsForClient(clientId));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponseDTO> acceptBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.acceptBooking(id));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponseDTO> rejectBooking(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, principal.getName()));
    }

    @PutMapping("/{id}/reschedule")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponseDTO> rescheduleBooking(
            @PathVariable Long id,
            Principal principal,
            @RequestBody SessionRescheduleRequestDTO body) {
        return ResponseEntity.ok(bookingService.rescheduleBooking(id, principal.getName(), body));
    }

    @PutMapping("/{id}/confirm-reschedule")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<BookingResponseDTO> confirmReschedule(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.confirmReschedule(id, principal.getName()));
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponseDTO> completeBooking(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.completeBooking(id, principal.getName()));
    }

    @PutMapping("/{id}/not-complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<BookingResponseDTO> markNotCompleted(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.markNotCompleted(id, principal.getName()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingResponseDTO> cancelSession(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, principal.getName()));
    }
}