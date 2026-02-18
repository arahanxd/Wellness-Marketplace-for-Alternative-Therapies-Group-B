package com.wellness.backend.controller;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Collections;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.wellness.backend.service.EmailService emailService;

    // Returns all practitioners (PROVIDERS)
    @GetMapping("/users")
    public ResponseEntity<List<UserEntity>> getAllPractitioners() {
        System.out.println("DEBUG: Fetching all practitioners for admin dashboard");
        List<UserEntity> practitioners = userRepository.findByRole("PROVIDER");
        System.out.println("DEBUG: Found " + practitioners.size() + " practitioners");
        return ResponseEntity.ok(practitioners);
    }

    // New: Returns all users in the system (CLIENT and PROVIDER)
    @GetMapping("/all-users")
    public ResponseEntity<List<UserEntity>> getAllSystemUsers() {
        System.out.println("DEBUG: Fetching all system users");
        List<UserEntity> users = userRepository.findAll();
        // Exclude admins from the list if desired, but here we'll return all
        return ResponseEntity.ok(users);
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        System.out.println("DEBUG: Admin approving user ID: " + id);
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            System.out.println("DEBUG: User not found for approval: " + id);
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Practitioner not found"));
        }

        String oldStatus = user.getVerificationStatus();
        user.setVerificationStatus("APPROVED");
        user.setEmailVerified(true);
        userRepository.save(user);
        System.out
                .println("DEBUG: User " + user.getEmail() + " status transitioned from " + oldStatus + " to APPROVED");

        emailService.sendApprovalEmail(user.getEmail());
        return ResponseEntity.ok(Collections.singletonMap("message", "User approved successfully"));
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        System.out.println("DEBUG: Admin rejecting user ID: " + id);
        UserEntity user = userRepository.findById(id).orElse(null);
        if (user == null) {
            System.out.println("DEBUG: User not found for rejection: " + id);
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("error", "Practitioner not found"));
        }

        String oldStatus = user.getVerificationStatus();
        user.setVerificationStatus("REJECTED");
        userRepository.save(user);
        System.out
                .println("DEBUG: User " + user.getEmail() + " status transitioned from " + oldStatus + " to REJECTED");

        emailService.sendRejectionEmail(user.getEmail());
        return ResponseEntity.ok(Collections.singletonMap("message", "User rejected successfully"));
    }
}
