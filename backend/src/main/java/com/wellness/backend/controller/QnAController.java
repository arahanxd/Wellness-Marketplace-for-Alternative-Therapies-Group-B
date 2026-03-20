package com.wellness.backend.controller;

import com.wellness.backend.dto.ProductAnswerDTO;
import com.wellness.backend.dto.ProductQuestionDTO;
import com.wellness.backend.service.QnAService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/qna")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class QnAController {

    private final QnAService qnaService;

    @PostMapping("/questions")
    public ResponseEntity<ProductQuestionDTO> askQuestion(@RequestBody ProductQuestionDTO dto) {
        return ResponseEntity.ok(qnaService.askQuestion(dto));
    }

    @PostMapping("/answers")
    public ResponseEntity<ProductAnswerDTO> postAnswer(@RequestBody ProductAnswerDTO dto) {
        return ResponseEntity.ok(qnaService.postAnswer(dto));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ProductQuestionDTO>> getProductQuestions(@PathVariable Long productId) {
        return ResponseEntity.ok(qnaService.getProductQuestions(productId));
    }
}
