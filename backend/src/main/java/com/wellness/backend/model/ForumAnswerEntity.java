package com.wellness.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "forum_answers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForumAnswerEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private ForumQuestionEntity question;

    @Column(name = "upvotes", columnDefinition = "INT DEFAULT 0")
    private Integer upvotes = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_accepted", nullable = false)
    private boolean accepted = false;

    @ElementCollection
    @CollectionTable(name = "forum_answer_upvotes", joinColumns = @JoinColumn(name = "answer_id"))
    @Column(name = "user_id")
    private Set<Long> upvotedUserIds = new HashSet<>();

    // Bug #2 Fix: mappedBy prevents "Question not found" or parent invalidation
    @OneToMany(mappedBy = "answer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ForumCommentEntity> comments;
}
