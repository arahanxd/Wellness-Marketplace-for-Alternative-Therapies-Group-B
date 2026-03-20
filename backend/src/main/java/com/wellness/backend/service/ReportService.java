package com.wellness.backend.service;

import com.wellness.backend.dto.ReportDTO;
import com.wellness.backend.exception.ResourceNotFoundException;
import com.wellness.backend.model.*;
import com.wellness.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    // Repos for fetching the reported content
    private final ProductRepository productRepository;
    private final ProductQuestionRepository productQuestionRepository;
    private final ProductAnswerRepository productAnswerRepository;
    private final ForumQuestionRepository forumQuestionRepository;
    private final ForumAnswerRepository forumAnswerRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final ProductReviewRepository productReviewRepository;

    public ReportDTO createReport(Long reporterId, Long reportedEntityId, ReportEntityType type, ReportReason reason,
            String comment) {
        UserEntity reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found with ID: " + reporterId));

        // Validate reported entity exists
        boolean exists = false;
        switch (type) {
            case PRODUCT:
                exists = productRepository.existsById(reportedEntityId);
                break;
            case PRODUCT_QUESTION:
                exists = productQuestionRepository.existsById(reportedEntityId);
                break;
            case PRODUCT_ANSWER:
                exists = productAnswerRepository.existsById(reportedEntityId);
                break;
            case FORUM_POST:
            case FORUM_QUESTION:
                exists = forumQuestionRepository.existsById(reportedEntityId);
                break;
            case FORUM_ANSWER:
                exists = forumAnswerRepository.existsById(reportedEntityId);
                break;
            case FORUM_COMMENT:
                exists = forumCommentRepository.existsById(reportedEntityId);
                break;
            case PRODUCT_REVIEW:
                exists = productReviewRepository.existsById(reportedEntityId);
                break;
            case PRACTITIONER:
                exists = userRepository.findById(reportedEntityId)
                        .map(u -> "PROVIDER".equals(u.getRole())).orElse(false);
                break;
        }

        if (!exists) {
            throw new ResourceNotFoundException(type + " not found with ID: " + reportedEntityId);
        }

        ReportEntity report = new ReportEntity();
        report.setReporter(reporter);
        report.setReportedByUserId(getContentOwnerId(reportedEntityId, type));
        report.setReportedEntityId(reportedEntityId);
        report.setEntityType(type);
        report.setReason(reason);
        report.setComment(comment);
        report.setStatus("PENDING");

        ReportEntity saved = reportRepository.save(report);
        return mapToDTO(saved);
    }

    public List<ReportDTO> getAllReports() {
        return reportRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void resolveReport(Long reportId, String action) {
        ReportEntity report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));

        if ("DELETE_CONTENT".equalsIgnoreCase(action)) {
            deleteReportedContent(report.getReportedEntityId(), report.getEntityType());
        } else if ("SUSPEND_USER".equalsIgnoreCase(action)) {
            suspendUserBehindContent(report.getReportedEntityId(), report.getEntityType());
        }

        report.setStatus("RESOLVED");
        reportRepository.save(report);
    }

    private void deleteReportedContent(Long entityId, ReportEntityType type) {
        switch (type) {
            case PRODUCT:
                productRepository.deleteById(entityId);
                break;
            case PRODUCT_QUESTION:
                productQuestionRepository.deleteById(entityId);
                break;
            case PRODUCT_ANSWER:
                productAnswerRepository.deleteById(entityId);
                break;
            case FORUM_POST:
            case FORUM_QUESTION:
                forumQuestionRepository.deleteById(entityId);
                break;
            case FORUM_ANSWER:
                forumAnswerRepository.deleteById(entityId);
                break;
            case FORUM_COMMENT:
                forumCommentRepository.deleteById(entityId);
                break;
            case PRODUCT_REVIEW:
                productReviewRepository.deleteById(entityId);
                break;
            case PRACTITIONER:
                // Suspend instead of delete for practitioners
                suspendUserBehindContent(entityId, type);
                break;
        }
    }

    private Long getContentOwnerId(Long entityId, ReportEntityType type) {
        UserEntity owner = null;
        switch (type) {
            case PRODUCT:
                owner = productRepository.findById(entityId).map(ProductEntity::getProvider).orElse(null);
                break;
            case PRODUCT_QUESTION:
                owner = productQuestionRepository.findById(entityId).map(ProductQuestionEntity::getUser).orElse(null);
                break;
            case PRODUCT_ANSWER:
                owner = productAnswerRepository.findById(entityId).map(ProductAnswerEntity::getUser).orElse(null);
                break;
            case FORUM_POST:
            case FORUM_QUESTION:
                owner = forumQuestionRepository.findById(entityId).map(ForumQuestionEntity::getUser).orElse(null);
                break;
            case FORUM_ANSWER:
                owner = forumAnswerRepository.findById(entityId).map(ForumAnswerEntity::getUser).orElse(null);
                break;
            case FORUM_COMMENT:
                owner = forumCommentRepository.findById(entityId).map(ForumCommentEntity::getUser).orElse(null);
                break;
            case PRODUCT_REVIEW:
                owner = productReviewRepository.findById(entityId).map(ProductReviewEntity::getUser).orElse(null);
                break;
            case PRACTITIONER:
                owner = userRepository.findById(entityId).orElse(null);
                break;
        }
        return owner != null ? owner.getId() : 0L;
    }

    private void suspendUserBehindContent(Long entityId, ReportEntityType type) {
        UserEntity userToSuspend = null;
        switch (type) {
            case PRODUCT:
                userToSuspend = productRepository.findById(entityId).map(ProductEntity::getProvider).orElse(null);
                break;
            case PRODUCT_QUESTION:
                userToSuspend = productQuestionRepository.findById(entityId).map(ProductQuestionEntity::getUser)
                        .orElse(null);
                break;
            case PRODUCT_ANSWER:
                userToSuspend = productAnswerRepository.findById(entityId).map(ProductAnswerEntity::getUser)
                        .orElse(null);
                break;
            case FORUM_POST:
            case FORUM_QUESTION:
                userToSuspend = forumQuestionRepository.findById(entityId).map(ForumQuestionEntity::getUser)
                        .orElse(null);
                break;
            case FORUM_ANSWER:
                userToSuspend = forumAnswerRepository.findById(entityId).map(ForumAnswerEntity::getUser).orElse(null);
                break;
            case FORUM_COMMENT:
                userToSuspend = forumCommentRepository.findById(entityId).map(ForumCommentEntity::getUser).orElse(null);
                break;
            case PRODUCT_REVIEW:
                userToSuspend = productReviewRepository.findById(entityId).map(ProductReviewEntity::getUser)
                        .orElse(null);
                break;
            case PRACTITIONER:
                userToSuspend = userRepository.findById(entityId).orElse(null);
                break;
        }

        if (userToSuspend != null) {
            userToSuspend.setVerificationStatus("SUSPENDED");
            userRepository.save(userToSuspend);
        }
    }

    private ReportDTO mapToDTO(ReportEntity entity) {
        ReportDTO dto = new ReportDTO();
        try {
            dto.setReportId(entity.getReportId());
            dto.setReporterId(entity.getReporter() != null ? entity.getReporter().getId() : 0L);
            dto.setReporterName(entity.getReporter() != null ? entity.getReporter().getName() : "Unknown Reporter");
            dto.setReportedEntityId(entity.getReportedEntityId());
            dto.setEntityType(entity.getEntityType() != null ? entity.getEntityType().name() : "UNKNOWN");
            dto.setReason(entity.getReason() != null ? entity.getReason().name() : "OTHER");
            dto.setComment(entity.getComment());
            dto.setStatus(entity.getStatus());
            dto.setCreatedAt(entity.getCreatedAt());

            // Try to fetch reported content preview
            String content = "Content preview unavailable";
            if (entity.getEntityType() != null) {
                try {
                    switch (entity.getEntityType()) {
                        case PRODUCT:
                            content = productRepository.findById(entity.getReportedEntityId())
                                    .map(ProductEntity::getName).orElse("Product not found");
                            break;
                        case PRODUCT_QUESTION:
                            content = productQuestionRepository.findById(entity.getReportedEntityId())
                                    .map(ProductQuestionEntity::getContent).orElse("Question not found");
                            break;
                        case PRODUCT_ANSWER:
                            content = productAnswerRepository.findById(entity.getReportedEntityId())
                                    .map(ProductAnswerEntity::getContent).orElse("Answer not found");
                            break;
                        case FORUM_POST:
                        case FORUM_QUESTION:
                            content = forumQuestionRepository.findById(entity.getReportedEntityId())
                                    .map(ForumQuestionEntity::getContent).orElse("Forum post not found");
                            break;
                        case FORUM_ANSWER:
                            content = forumAnswerRepository.findById(entity.getReportedEntityId())
                                    .map(ForumAnswerEntity::getContent).orElse("Forum answer not found");
                            break;
                        case FORUM_COMMENT:
                            content = forumCommentRepository.findById(entity.getReportedEntityId())
                                    .map(ForumCommentEntity::getContent).orElse("Forum comment not found");
                            break;
                        case PRODUCT_REVIEW:
                            content = productReviewRepository.findById(entity.getReportedEntityId())
                                    .map(ProductReviewEntity::getDescription).orElse("Review not found");
                            break;
                        case PRACTITIONER:
                            content = userRepository.findById(entity.getReportedEntityId())
                                    .map(UserEntity::getName).orElse("Practitioner not found");
                            break;
                    }
                } catch (Exception e) {
                    content = "Error fetching preview: " + e.getMessage();
                }
            }
            dto.setReportedContent(content);
        } catch (Exception e) {
            System.err.println("Error mapping report " + entity.getReportId() + ": " + e.getMessage());
            dto.setReportedContent("Error mapping report data");
        }

        return dto;
    }
}
