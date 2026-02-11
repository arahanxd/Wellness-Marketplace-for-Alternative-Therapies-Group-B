package com.wellnesshub.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.wellnesshub.backend.user.UserEntity;
import com.wellnesshub.backend.user.UserRepository;
import com.wellnesshub.backend.user.UserRole;

@SpringBootApplication
public class WellnessBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(WellnessBackendApplication.class, args);
    }

    @Bean
    CommandLineRunner run(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.findByEmail("admin@example.com").isPresent()) {
                UserEntity admin = new UserEntity();
                admin.setFullName("Admin");
                admin.setEmail("admin@example.com");
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);
                System.out.println("✅ Admin created: admin@example.com / admin123");
            }
        };
    }
}
