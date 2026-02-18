package com.wellness.backend.controller;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.wellness.backend.service.EmailService emailService;

    // Returns all practitioners (PROVIDERS only)
    @GetMapping("/users")
    public ResponseEntity<List<UserEntity>> getAllPractitioners() {
        List<UserEntity> practitioners = userRepository.findByRole("PROVIDER");
        return ResponseEntity.ok(practitioners);
    }

    // Returns all users in the system (CLIENT and PROVIDER, excluding ADMIN)
    @GetMapping("/all-users")
    public ResponseEntity<List<UserEntity>> getAllSystemUsers() {
        List<UserEntity> users = userRepository.findAll().stream()
                .filter(u -> !"ADMIN".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // Approve a practitioner (can be called multiple times regardless of current
    // status)
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("error", "User not found"));
        }

        String oldStatus = user.getVerificationStatus();
        user.setVerificationStatus("APPROVED");
        user.setVerified(true);
        user.setAdminComment(null); // Clear any previous rejection comment
        userRepository.save(user);
        System.out.println("DEBUG: User " + user.getEmail() + " status: " + oldStatus + " → APPROVED");

        try {
            emailService.sendApprovalEmail(user.getEmail());
        } catch (Exception e) {
            System.out.println("Email send failed: " + e.getMessage());
        }
        return ResponseEntity.ok(Collections.singletonMap("message", "User approved successfully"));
    }

    // Reject a practitioner with optional comment (can be called multiple times)
    @PutMapping("/reject/{id}")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("error", "User not found"));
        }

        String oldStatus = user.getVerificationStatus();
        user.setVerificationStatus("REJECTED");
        user.setVerified(false);

        // Save admin comment if provided
        if (body != null && body.containsKey("comment") && body.get("comment") != null
                && !body.get("comment").isBlank()) {
            user.setAdminComment(body.get("comment"));
        }

        userRepository.save(user);
        System.out.println("DEBUG: User " + user.getEmail() + " status: " + oldStatus + " → REJECTED");

        try {
            emailService.sendRejectionEmail(user.getEmail());
        } catch (Exception e) {
            System.out.println("Email send failed: " + e.getMessage());
        }
        return ResponseEntity.ok(Collections.singletonMap("message", "User rejected successfully"));
    }

    // Request document reupload from practitioner
    @PutMapping("/request-reupload/{id}")
    public ResponseEntity<?> requestReupload(@PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404)
                    .body(Collections.singletonMap("error", "User not found"));
        }

        user.setVerificationStatus("REUPLOAD_REQUESTED");
        user.setVerified(false);

        if (body != null && body.containsKey("comment") && body.get("comment") != null
                && !body.get("comment").isBlank()) {
            user.setAdminComment(body.get("comment"));
        }

        userRepository.save(user);
        System.out.println("DEBUG: Reupload requested for user " + user.getEmail());

        return ResponseEntity.ok(Collections.singletonMap("message", "Reupload requested successfully"));
    }
}
