package com.wellness.backend.config;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String adminEmail = "admin123@gmail.com";
        Optional<UserEntity> adminOpt = userRepository.findByEmail(adminEmail);

        if (adminOpt.isEmpty()) {
            log.info("Creating default admin user: {}", adminEmail);
            UserEntity admin = new UserEntity();
            admin.setName("System Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("admin123@"));
            admin.setRole("ADMIN");
            admin.setCity("Bangalore");
            admin.setCountry("India");
            admin.setVerified(true);
            admin.setEmailVerified(true);
            admin.setVerificationStatus("APPROVED");
            userRepository.save(admin);
            log.info("Admin user created successfully.");
        } else {
            // Optional: Ensure password/role is correct even if it exists
            UserEntity admin = adminOpt.get();
            if (!"ADMIN".equals(admin.getRole())) {
                admin.setRole("ADMIN");
                userRepository.save(admin);
                log.info("Updated existing user {} to ADMIN role.", adminEmail);
            }
        }
    }
}
