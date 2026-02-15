package com.wellnesshub.backend.auth;

import com.wellnesshub.backend.security.JwtService;
import com.wellnesshub.backend.user.UserEntity;
import com.wellnesshub.backend.user.UserRepository;
import com.wellnesshub.backend.practitioner.PractitionerProfileEntity;
import com.wellnesshub.backend.practitioner.PractitionerProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PractitionerProfileRepository practitionerProfileRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PractitionerProfileRepository practitionerProfileRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.practitionerProfileRepository = practitionerProfileRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            String name = request.get("fullName");
            String role = request.get("role");
            String city = request.get("city");
            String country = request.get("country");
            String specialization = request.get("specialization");

            if (email == null || password == null || name == null || role == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing required fields"
                ));
            }

            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Email already exists"
                ));
            }

            // Create user
            UserEntity user = new UserEntity();
            user.setName(name);
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setCity(city);
            user.setCountry(country);
            user.setIsActive(true);

            UserEntity savedUser = userRepository.save(user);

            // If Practitioner → create profile
            if ("PRACTITIONER".equalsIgnoreCase(role)) {
                PractitionerProfileEntity profile = new PractitionerProfileEntity();
                profile.setUser(savedUser);
                profile.setSpecialization(specialization != null ? specialization : "General");
                profile.setClinicName(city != null ? city : "Default Clinic");
                profile.setVerificationStatus(
                        PractitionerProfileEntity.VerificationStatus.PENDING
                );
                profile.setCreatedAt(new Timestamp(System.currentTimeMillis()));
                practitionerProfileRepository.save(profile);
            }

            // Generate JWT
            Map<String, Object> claims = new HashMap<>();
            claims.put("email", savedUser.getEmail());
            claims.put("role", savedUser.getRole());

            String token = jwtService.generateToken(claims, savedUser.getEmail());

            // ✅ MATCHES FRONTEND
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("accessToken", token);
            response.put("refreshToken", "");
            response.put("role", savedUser.getRole());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Registration failed"
            ));
        }
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing email or password"
                ));
            }

            UserEntity user = userRepository.findByEmail(email).orElse(null);

            if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid credentials"
                ));
            }

            Map<String, Object> claims = new HashMap<>();
            claims.put("email", user.getEmail());
            claims.put("role", user.getRole());

            String token = jwtService.generateToken(claims, user.getEmail());

            // ✅ MATCHES FRONTEND
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("accessToken", token);
            response.put("refreshToken", "");
            response.put("role", user.getRole());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Login failed"
            ));
        }
    }
}
