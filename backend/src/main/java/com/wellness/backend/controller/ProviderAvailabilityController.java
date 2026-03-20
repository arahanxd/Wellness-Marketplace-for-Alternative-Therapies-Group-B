package com.wellness.backend.controller;

import com.wellness.backend.dto.AvailabilitySlotRequestDTO;
import com.wellness.backend.dto.AvailabilitySlotResponseDTO;
import com.wellness.backend.service.ProviderAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/availability")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProviderAvailabilityController {

    private final ProviderAvailabilityService availabilityService;

    /**
     * Returns all availability slots for a given provider.
     * Public endpoint — used by clients when picking booking times.
     */
    @GetMapping("/{providerId}")
    public ResponseEntity<List<AvailabilitySlotResponseDTO>> getAvailability(@PathVariable Long providerId) {
        return ResponseEntity.ok(availabilityService.getAvailability(providerId));
    }

    /**
     * Adds a new availability slot for the authenticated provider.
     */
    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<AvailabilitySlotResponseDTO> addSlot(
            Principal principal,
            @Valid @RequestBody AvailabilitySlotRequestDTO request) {
        return ResponseEntity.ok(availabilityService.addSlot(principal.getName(), request));
    }

    /**
     * Deletes an availability slot owned by the authenticated provider.
     */
    @DeleteMapping("/{slotId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<Void> deleteSlot(
            @PathVariable Long slotId,
            Principal principal) {
        availabilityService.deleteSlot(slotId, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
