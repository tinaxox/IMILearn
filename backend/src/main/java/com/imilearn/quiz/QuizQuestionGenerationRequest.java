package com.imilearn.quiz;

import com.imilearn.common.BaseEntity;
import com.imilearn.subject.Subject;
import com.imilearn.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "quiz_question_generation_requests")
@EqualsAndHashCode(callSuper = true, exclude = { "subject", "requestedBy" })
@ToString(exclude = { "subject", "requestedBy" })
public class QuizQuestionGenerationRequest extends BaseEntity {

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(columnDefinition = "bigint[]", nullable = false)
    private List<Long> materialIds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private User requestedBy;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer requestedQuestionCount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GenerationStatus status;

    private Long resultQuizId;

    private String errorMessage;
}
