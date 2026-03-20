package com.wellness.backend.controller;

import com.wellness.backend.dto.ForumAnswerDTO;
import com.wellness.backend.dto.ForumCommentDTO;
import com.wellness.backend.dto.ForumQuestionDTO;
import com.wellness.backend.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.wellness.backend.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ForumController {

    private final ForumService forumService;
    private final UserService userService;

    @GetMapping("/questions")
    public ResponseEntity<List<ForumQuestionDTO>> getAllQuestions() {
        return ResponseEntity.ok(forumService.getAllQuestions(getCurrentUserIdOrNull()));
    }

    @GetMapping("/questions/search")
    public ResponseEntity<List<ForumQuestionDTO>> searchQuestions(@RequestParam String q) {
        return ResponseEntity.ok(forumService.searchQuestions(q, getCurrentUserIdOrNull()));
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<ForumQuestionDTO> getQuestionById(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.getQuestionById(id, getCurrentUserIdOrNull()));
    }

    @PostMapping("/questions")
    public ResponseEntity<ForumQuestionDTO> askQuestion(@RequestBody ForumQuestionDTO dto) {
        return ResponseEntity.ok(forumService.askQuestion(dto));
    }

    @PostMapping("/answers")
    public ResponseEntity<ForumAnswerDTO> postAnswer(@RequestBody ForumAnswerDTO dto) {
        return ResponseEntity.ok(forumService.postAnswer(dto));
    }

    @PostMapping("/comments")
    public ResponseEntity<ForumCommentDTO> postComment(@RequestBody ForumCommentDTO dto) {
        return ResponseEntity.ok(forumService.postComment(dto));
    }

    @PutMapping("/questions/{id}/upvote")
    public ResponseEntity<?> upvoteQuestion(@PathVariable Long id) {
        forumService.upvoteQuestion(id, getCurrentUserId());
        return ResponseEntity.ok(Map.of("message", "Upvoted"));
    }

    @PutMapping("/answers/{id}/upvote")
    public ResponseEntity<?> upvoteAnswer(@PathVariable Long id) {
        forumService.upvoteAnswer(id, getCurrentUserId());
        return ResponseEntity.ok(Map.of("message", "Upvoted"));
    }

    private Long getCurrentUserIdOrNull() {
        try {
            return getCurrentUserId();
        } catch (Exception e) {
            return null;
        }
    }

    private Long getCurrentUserId() {
        String email = "";
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else if (principal != null) {
            email = principal.toString();
        } else {
            throw new RuntimeException("No authenticated user found");
        }
        return userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Logged in user not found"))
                .getId();
    }

    @PutMapping("/answers/{id}/accept")
    public ResponseEntity<?> acceptAnswer(@PathVariable Long id) {
        forumService.acceptAnswer(id);
        return ResponseEntity.ok(Map.of("message", "Answer accepted"));
    }
}

