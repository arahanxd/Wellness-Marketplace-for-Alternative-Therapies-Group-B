package com.wellnesshub.backend.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ===============================
    // 1️⃣ GET PROFILE (Authenticated)
    // ===============================
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication auth) {

        String email = auth.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().name());
        profile.put("city", user.getCity());
        profile.put("country", user.getCountry());

        if (user.getRole() == UserRole.PRACTITIONER) {
            profile.put("specialization", user.getSpecialization());
            profile.put("verificationStatus", user.getVerificationStatus());
        }

        return ResponseEntity.ok(profile);
    }

    // ===============================
    // 2️⃣ DASHBOARD (Role Based)
    // ===============================
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication auth) {

        String email = auth.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> dashboard = new HashMap<>();

        Map<String, String> profileMap = new HashMap<>();
        profileMap.put("fullName", user.getFullName());
        profileMap.put("email", user.getEmail());
        profileMap.put("role", user.getRole().name());

        dashboard.put("profile", profileMap);

        if (user.getRole() == UserRole.PATIENT) {
            dashboard.put("sessionHistory", new ArrayList<>());
            dashboard.put("productOrders", new ArrayList<>());
        } 
        else if (user.getRole() == UserRole.PRACTITIONER) {
            dashboard.put("specialization", user.getSpecialization());
            dashboard.put("verificationStatus", user.getVerificationStatus());
        }

        return ResponseEntity.ok(dashboard);
    }

    // ===============================
    // 3️⃣ ADMIN VERIFY PRACTITIONER
    // ===============================
    @PutMapping("/admin/verify/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> verifyPractitioner(@PathVariable Long id) {

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.PRACTITIONER) {
            return ResponseEntity.badRequest().body("User is not a practitioner");
        }

        user.setVerificationStatus("APPROVED");
        userRepository.save(user);

        return ResponseEntity.ok("Practitioner approved successfully");
    }

    // ===============================
    // 4️⃣ ADMIN REJECT PRACTITIONER
    // ===============================
    @PutMapping("/admin/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> rejectPractitioner(@PathVariable Long id) {

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != UserRole.PRACTITIONER) {
            return ResponseEntity.badRequest().body("User is not a practitioner");
        }

        user.setVerificationStatus("REJECTED");
        userRepository.save(user);

        return ResponseEntity.ok("Practitioner rejected successfully");
    }

    // ===============================
    // 5️⃣ GET ALL APPROVED PRACTITIONERS (Public)
    // ===============================
    @GetMapping("/practitioners")
    public ResponseEntity<List<UserEntity>> getApprovedPractitioners() {

        List<UserEntity> practitioners = userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getRole() == UserRole.PRACTITIONER &&
                        "APPROVED".equals(user.getVerificationStatus()))
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(practitioners);
    }
}
