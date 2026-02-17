package com.wellness.backend.controller;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/practitioners")
    public ResponseEntity<List<UserEntity>> getAllPractitioners() {
        return ResponseEntity.ok(userRepository.findByRole("PROVIDER"));
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        UserEntity user = userRepository.findById(id).orElseThrow();
        user.setVerificationStatus("APPROVED");
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        UserEntity user = userRepository.findById(id).orElseThrow();
        user.setVerificationStatus("REJECTED");
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}
