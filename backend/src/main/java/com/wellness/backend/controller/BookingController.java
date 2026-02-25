package com.wellness.backend.controller;

import com.wellness.backend.dto.BookingRequestDTO;
import com.wellness.backend.dto.BookingResponseDTO;
import com.wellness.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponseDTO> createBooking(@RequestBody BookingRequestDTO request) {
        return ResponseEntity.ok(bookingService.createBooking(request));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<BookingResponseDTO>> getClientUpcomingBookings(@PathVariable Long clientId) {
        return ResponseEntity.ok(bookingService.getClientUpcomingBookings(clientId));
    }

    @GetMapping("/practitioner/{practitionerId}")
    public ResponseEntity<List<BookingResponseDTO>> getPractitionerUpcomingBookings(@PathVariable Long practitionerId) {
        return ResponseEntity.ok(bookingService.getPractitionerUpcomingBookings(practitionerId));
    }
}