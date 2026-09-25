package com.imilearn.assignment.dto;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AssignmentSubmissionResponse {
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String studentEmail;
    private String studentName;
    private String studentSurname;
    private Double points;
    private String textContent;
    private List<SubmissionFileResponse> files;
    private Instant createdAt;
    private Instant updatedAt;
}
