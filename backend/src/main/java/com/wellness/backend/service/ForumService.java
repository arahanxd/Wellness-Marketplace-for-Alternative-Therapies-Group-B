package com.wellness.backend.service;

import com.wellness.backend.dto.ForumAnswerDTO;
import com.wellness.backend.dto.ForumCommentDTO;
import com.wellness.backend.dto.ForumQuestionDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.*;
import com.wellness.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumQuestionRepository questionRepository;
    private final ForumAnswerRepository answerRepository;
    private final ForumCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public List<ForumQuestionDTO> getAllQuestions(Long viewerId) {
        return questionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(q -> mapQuestionToDTOWithAnswers(q, viewerId))
                .collect(Collectors.toList());
    }

    public List<ForumQuestionDTO> searchQuestions(String query, Long viewerId) {
        return questionRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(query, query).stream()
                .map(q -> mapQuestionToDTOWithAnswers(q, viewerId))
                .collect(Collectors.toList());
    }

    @Transactional
    public ForumQuestionDTO getQuestionById(Long id, Long viewerId) {
        ForumQuestionEntity question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));
        question.setViewCount(question.getViewCount() + 1);
        questionRepository.save(question);
        return mapQuestionToDTOWithAnswers(question, viewerId);
    }

    public ForumQuestionDTO askQuestion(ForumQuestionDTO dto) {
        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ForumQuestionEntity question = new ForumQuestionEntity();
        question.setTitle(dto.getTitle());
        question.setContent(dto.getContent());
        question.setUser(user);

        if (dto.getProductId() != null) {
            ProductEntity product = productRepository.findById(dto.getProductId()).orElse(null);
            question.setProduct(product);
        }

        ForumQuestionEntity saved = questionRepository.save(question);
        return mapQuestionToDTO(saved, dto.getUserId());
    }

    @Transactional
    public ForumAnswerDTO postAnswer(ForumAnswerDTO dto) {
        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ForumQuestionEntity question = questionRepository.findById(dto.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found"));

        ForumAnswerEntity answer = new ForumAnswerEntity();
        answer.setContent(dto.getContent());
        answer.setUser(user);
        answer.setQuestion(question);

        ForumAnswerEntity saved = answerRepository.save(answer);
        return mapAnswerToDTO(saved, dto.getUserId());
    }

    @Transactional
    public ForumCommentDTO postComment(ForumCommentDTO dto) {
        UserEntity user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ForumAnswerEntity answer = answerRepository.findById(dto.getAnswerId())
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));

        ForumCommentEntity comment = new ForumCommentEntity();
        comment.setContent(dto.getContent());
        comment.setUser(user);
        comment.setAnswer(answer);

        ForumCommentEntity saved = commentRepository.save(comment);
        return mapCommentToDTO(saved);
    }

    @Transactional
    public void upvoteQuestion(Long id, Long userId) {
        ForumQuestionEntity question = questionRepository.findById(id).orElseThrow();
        if (question.getUpvotedUserIds().contains(userId)) {
            question.getUpvotedUserIds().remove(userId);
            question.setUpvotes(Math.max(0, question.getUpvotes() - 1));
        } else {
            question.getUpvotedUserIds().add(userId);
            question.setUpvotes(question.getUpvotes() + 1);
        }
        questionRepository.save(question);
    }

    @Transactional
    public void upvoteAnswer(Long id, Long userId) {
        ForumAnswerEntity answer = answerRepository.findById(id).orElseThrow();
        if (answer.getUpvotedUserIds().contains(userId)) {
            answer.getUpvotedUserIds().remove(userId);
            answer.setUpvotes(Math.max(0, answer.getUpvotes() - 1));
        } else {
            answer.getUpvotedUserIds().add(userId);
            answer.setUpvotes(answer.getUpvotes() + 1);
        }
        answerRepository.save(answer);
    }

    @Transactional
    public void acceptAnswer(Long id) {
        ForumAnswerEntity answer = answerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Answer not found"));

        // Mark as accepted
        answer.setAccepted(true);
        answerRepository.save(answer);
    }

    private ForumQuestionDTO mapQuestionToDTO(ForumQuestionEntity entity, Long viewerId) {
        ForumQuestionDTO dto = new ForumQuestionDTO();
        dto.setQuestionId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        dto.setUserId(entity.getUser().getId());
        dto.setUserName(entity.getUser().getName());
        dto.setUpvotes(entity.getUpvotes());
        dto.setViewCount(entity.getViewCount());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setAnswerCount(entity.getAnswers() != null ? entity.getAnswers().size() : 0);
        dto.setHasUpvoted(viewerId != null && entity.getUpvotedUserIds().contains(viewerId));

        if (entity.getProduct() != null) {
            dto.setProductId(entity.getProduct().getProductId());
            dto.setName(entity.getProduct().getName());
        }

        return dto;
    }

    private ForumQuestionDTO mapQuestionToDTOWithAnswers(ForumQuestionEntity entity, Long viewerId) {
        ForumQuestionDTO dto = mapQuestionToDTO(entity, viewerId);
        // Load answers and their comments
        List<ForumAnswerDTO> answerDTOs = entity.getAnswers().stream()
                .map(a -> mapAnswerToDTOWithComments(a, viewerId))
                .collect(Collectors.toList());
        dto.setAnswers(answerDTOs);
        return dto;
    }

    private ForumAnswerDTO mapAnswerToDTO(ForumAnswerEntity entity, Long viewerId) {
        ForumAnswerDTO dto = new ForumAnswerDTO();
        dto.setAnswerId(entity.getId());
        dto.setQuestionId(entity.getQuestion().getId());
        dto.setContent(entity.getContent());
        dto.setUserId(entity.getUser().getId());
        dto.setUserName(entity.getUser().getName());
        dto.setUserRole(entity.getUser().getRole());
        dto.setUpvotes(entity.getUpvotes());
        dto.setAccepted(entity.isAccepted());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setHasUpvoted(viewerId != null && entity.getUpvotedUserIds().contains(viewerId));
        return dto;
    }

    private ForumAnswerDTO mapAnswerToDTOWithComments(ForumAnswerEntity entity, Long viewerId) {
        ForumAnswerDTO dto = mapAnswerToDTO(entity, viewerId);
        List<ForumCommentDTO> commentDTOs = entity.getComments().stream()
                .map(this::mapCommentToDTO)
                .collect(Collectors.toList());
        dto.setComments(commentDTOs);
        return dto;
    }

    private ForumCommentDTO mapCommentToDTO(ForumCommentEntity entity) {
        ForumCommentDTO dto = new ForumCommentDTO();
        dto.setCommentId(entity.getId());
        dto.setAnswerId(entity.getAnswer().getId());
        dto.setContent(entity.getContent());
        dto.setUserId(entity.getUser().getId());
        dto.setUserName(entity.getUser().getName());
        dto.setUserRole(entity.getUser().getRole());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
