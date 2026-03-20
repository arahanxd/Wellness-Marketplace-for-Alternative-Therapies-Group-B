package com.wellness.backend.service;

import com.wellness.backend.dto.ProductAnswerDTO;
import com.wellness.backend.dto.ProductQuestionDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.*;
import com.wellness.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QnAService {

    private final ProductQuestionRepository questionRepository;
    private final ProductAnswerRepository answerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ProductQuestionDTO askQuestion(ProductQuestionDTO dto) {
        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProductEntity product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        ProductQuestionEntity question = new ProductQuestionEntity();
        question.setContent(dto.getContent());
        question.setUser(user);
        question.setProduct(product);

        ProductQuestionEntity saved = questionRepository.save(question);
        return mapQuestionToDTO(saved);
    }

    public ProductAnswerDTO postAnswer(ProductAnswerDTO dto) {
        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProductQuestionEntity question = questionRepository.findById(dto.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        // Validation: Owner or Purchaser
        boolean isOwner = question.getProduct().getProvider().getId().equals(user.getId());
        boolean hasPurchased = orderRepository.findByUser(user).stream()
                .anyMatch(order -> order.getProduct().getProductId().equals(question.getProduct().getProductId()) && "COMPLETED".equalsIgnoreCase(order.getStatus()));

        if (!isOwner && !hasPurchased) {
            throw new IllegalStateException("Only the product owner or purchasers can answer questions");
        }

        ProductAnswerEntity answer = new ProductAnswerEntity();
        answer.setContent(dto.getContent());
        answer.setUser(user);
        answer.setQuestion(question);

        ProductAnswerEntity saved = answerRepository.save(answer);
        return mapAnswerToDTO(saved);
    }

    public List<ProductQuestionDTO> getProductQuestions(Long productId) {
        return questionRepository.findByProduct_ProductId(productId).stream()
                .map(this::mapQuestionToDTO)
                .collect(Collectors.toList());
    }

    private ProductQuestionDTO mapQuestionToDTO(ProductQuestionEntity entity) {
        ProductQuestionDTO dto = new ProductQuestionDTO();
        dto.setQuestionId(entity.getQuestionId());
        dto.setProductId(entity.getProduct().getProductId());
        dto.setUserId(entity.getUser().getId());
        dto.setUserName(entity.getUser().getName());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setAnswers(answerRepository.findByQuestion_QuestionId(entity.getQuestionId()).stream()
                .map(this::mapAnswerToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private ProductAnswerDTO mapAnswerToDTO(ProductAnswerEntity entity) {
        ProductAnswerDTO dto = new ProductAnswerDTO();
        dto.setAnswerId(entity.getAnswerId());
        dto.setQuestionId(entity.getQuestion().getQuestionId());
        dto.setUserId(entity.getUser().getId());
        dto.setUserName(entity.getUser().getName());
        dto.setUserRole(entity.getUser().getRole());
        dto.setContent(entity.getContent());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
