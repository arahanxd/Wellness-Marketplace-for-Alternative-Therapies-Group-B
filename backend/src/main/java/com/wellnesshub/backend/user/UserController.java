package com.wellnesshub.backend.user;

import com.wellnesshub.backend.practitioner.PractitionerProfileEntity;
import com.wellnesshub.backend.practitioner.PractitionerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PractitionerProfileRepository practitionerProfileRepository;

    // Get basic user profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String email = authentication.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    // Get dashboard data
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        String email = authentication.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> data = new HashMap<>();
        Map<String, String> profile = new HashMap<>();
        profile.put("fullName", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        data.put("profile", profile);

        if ("PRACTITIONER".equals(user.getRole())) {
            PractitionerProfileEntity practProfile = practitionerProfileRepository.findByUser(user)
                    .orElse(null);
            if (practProfile != null) {
                data.put("specialization", practProfile.getSpecialization());
                data.put("verificationStatus", practProfile.getVerificationStatus().toString());
            }
        }

        // Mock history/orders
        data.put("sessionHistory", List.of());
        data.put("productOrders", List.of());

        return ResponseEntity.ok(data);
    }

    // Upload degree file
    @PostMapping("/uploadDegree")
    public ResponseEntity<String> uploadDegree(@RequestParam("file") MultipartFile file,
                                               Authentication authentication) {
        String email = authentication.getName();
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PractitionerProfileEntity profile = practitionerProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Practitioner profile not found"));

        try {
            String uploadDir = "uploads/";
            Files.createDirectories(Paths.get(uploadDir));
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);
            Files.write(filePath, file.getBytes());

            profile.setDegreeFilePath(filePath.toString());
            practitionerProfileRepository.save(profile);

            return ResponseEntity.ok("File uploaded successfully");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Failed to upload file");
        }
    }

    // Get all practitioners (for admin)
    @GetMapping("/practitioners")
    public ResponseEntity<List<PractitionerProfileEntity>> getPendingPractitioners() {
        return ResponseEntity.ok(practitionerProfileRepository.findAll());
    }

    // Admin approves practitioner
    @PutMapping("/admin/verify/{id}")
    public ResponseEntity<?> verifyPractitioner(@PathVariable Long id) {
        PractitionerProfileEntity profile = practitionerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practitioner not found"));
        profile.setVerificationStatus(PractitionerProfileEntity.VerificationStatus.APPROVED);
        practitionerProfileRepository.save(profile);
        return ResponseEntity.ok().build();
    }

    // Admin rejects practitioner
    @PutMapping("/admin/reject/{id}")
    public ResponseEntity<?> rejectPractitioner(@PathVariable Long id) {
        PractitionerProfileEntity profile = practitionerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practitioner not found"));
        profile.setVerificationStatus(PractitionerProfileEntity.VerificationStatus.REJECTED);
        practitionerProfileRepository.save(profile);
        return ResponseEntity.ok().build();
    }
}
