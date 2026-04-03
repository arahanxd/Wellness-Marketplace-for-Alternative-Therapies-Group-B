package com.wellness.backend.controller;

import com.wellness.backend.dto.AiRequest;
import com.wellness.backend.dto.AiResponse;
import com.wellness.backend.service.AiRecommendationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiRecommendationController {

    private final AiRecommendationService service;

    public AiRecommendationController(AiRecommendationService service) {
        this.service = service;
        
    }

    @PostMapping("/recommendation")
    public AiResponse getRecommendation(@RequestBody AiRequest request) {
        return service.getRecommendation(request);
    }
}
