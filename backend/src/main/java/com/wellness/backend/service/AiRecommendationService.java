package com.wellness.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wellness.backend.config.GeminiConfig;
import com.wellness.backend.dto.AiRequest;
import com.wellness.backend.dto.AiResponse;
import com.wellness.backend.util.PromptBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.List;
@Service
public class AiRecommendationService {

    private final GeminiConfig config;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public AiRecommendationService(GeminiConfig config) {
        this.config = config;
        System.out.println("CONFIG KEY: " + config.getApiKey());
    }

    public AiResponse getRecommendation(AiRequest request) {
      
        
         try {
        
         String prompt = PromptBuilder.buildPrompt(request);
        
        // ✅ ADD THESE 2 LINES RIGHT HERE, after buildPrompt
        System.out.println("=== SYMPTOMS RECEIVED: " + request.symptoms);
        System.out.println("=== DURATION RECEIVED: " + request.duration);

      // ✅ Change to this
String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" 
    + config.getApiKey();

        // ✅ Use Jackson to build body safely
        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            )
        );
        String jsonBody = mapper.writeValueAsString(body);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(jsonBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
            url, HttpMethod.POST, entity, String.class
        );

        System.out.println("Gemini Raw Response: " + response.getBody());

        JsonNode root = mapper.readTree(response.getBody());
        String text = root
            .path("candidates").get(0)
            .path("content")
            .path("parts").get(0)
            .path("text")
            .asText();

        text = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
        return mapper.readValue(text, AiResponse.class);

    } catch (Exception e) {
        e.printStackTrace();
        throw new RuntimeException("AI recommendation failed: " + e.getMessage());
    }
    }
}
