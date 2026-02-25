package com.wellness.backend.service;

import com.wellness.backend.dto.BookingRequestDTO;
import com.wellness.backend.dto.BookingResponseDTO;
import com.wellness.backend.exception.BookingConflictException;
import com.wellness.backend.model.BookingEntity;
import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.BookingRepository;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public BookingResponseDTO createBooking(BookingRequestDTO request) {
        // Validate bookingDate is in the future
        if (request.getBookingDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Booking date must be in the future");
        }

        // Check for conflicts
        if (bookingRepository.existsByPractitioner_IdAndBookingDate(request.getPractitionerId(),
                request.getBookingDate())) {
            throw new BookingConflictException("This time slot is already booked.");
        }

        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserEntity practitioner = userRepository.findById(request.getPractitionerId())
                .orElseThrow(() -> new RuntimeException("Practitioner not found"));

        BookingEntity booking = new BookingEntity();
        booking.setUser(user);
        booking.setPractitioner(practitioner);
        booking.setBookingDate(request.getBookingDate());
        booking.setStatus("PENDING");
        booking.setNotes(request.getNotes());

        BookingEntity saved = bookingRepository.save(booking);
        return mapToResponseDTO(saved);
    }

    public List<BookingResponseDTO> getClientUpcomingBookings(Long clientId) {
        return bookingRepository.findByUser_Id(clientId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getPractitionerUpcomingBookings(Long practitionerId) {
        return bookingRepository.findByPractitioner_Id(practitionerId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    private BookingResponseDTO mapToResponseDTO(BookingEntity entity) {
        BookingResponseDTO dto = new BookingResponseDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUser().getId());
        dto.setPractitionerId(entity.getPractitioner().getId());
        dto.setBookingDate(entity.getBookingDate());
        dto.setNotes(entity.getNotes());
        dto.setStatus(entity.getStatus());
        return dto;
    }
}
