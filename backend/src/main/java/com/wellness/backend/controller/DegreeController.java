package com.wellness.backend.controller;

import com.wellness.backend.model.UserEntity;
import com.wellness.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173") // frontend URL
public class DegreeController {

    private final UserRepository userRepository;

    private final Path uploadDir = Paths.get("uploads/degrees");

    @PostMapping("/uploadDegree")
    public ResponseEntity<?> uploadDegree(@RequestParam("file") MultipartFile file,
                                          @RequestParam("userId") Long userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String fileName = user.getId() + "_degree.pdf";
            Path path = uploadDir.resolve(fileName);
            Files.createDirectories(uploadDir); // Ensure folder exists
            Files.write(path, file.getBytes());

            user.setDegreeFile(fileName);
            userRepository.save(user);

            return ResponseEntity.ok(Collections.singletonMap("message", "Degree uploaded"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    // ✅ Serve uploaded degree files
    @GetMapping("/degree/{userId}")
    public ResponseEntity<Resource> getDegree(@PathVariable Long userId) {
        try {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getDegreeFile() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = uploadDir.resolve(user.getDegreeFile());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.status(500).build();
        }
    }
}
