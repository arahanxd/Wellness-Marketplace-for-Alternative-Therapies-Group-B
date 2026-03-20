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
@Table(name = "forum_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ForumQuestionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    @Column(name = "upvotes", columnDefinition = "INT DEFAULT 0")
    private Integer upvotes = 0;

    @Column(name = "view_count", columnDefinition = "INT DEFAULT 0")
    private Integer viewCount = 0;

    @ElementCollection
    @CollectionTable(name = "forum_question_upvotes", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "user_id")
    private Set<Long> upvotedUserIds = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    // Bug #2 Fix: mappedBy prevents "Question not found" when deleting an answer if orphanRemoval is used incorrectly.
    // Also CascadeType.ALL ensures answers and comments are removed when a question is deleted.
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ForumAnswerEntity> answers;
}
