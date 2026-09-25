package com.imilearn.assignment;

import com.imilearn.common.BaseEntity;
import com.imilearn.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assignment_submissions", uniqueConstraints = @UniqueConstraint(columnNames = { "assignment_id",
        "student_id" }))
@EqualsAndHashCode(callSuper = true, exclude = { "assignment", "student", "files" })
@ToString(exclude = { "assignment", "student", "files" })
public class AssignmentSubmission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column
    private Double points;

    @Column(name = "text_content", columnDefinition = "TEXT")
    private String textContent;

    @Builder.Default
    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubmissionFile> files = new ArrayList<>();
}
