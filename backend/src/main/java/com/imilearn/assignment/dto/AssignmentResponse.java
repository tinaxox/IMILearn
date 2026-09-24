package com.imilearn.assignment.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AssignmentResponse {

    private Long id;
    private String title;
    private String description;
    private Instant dueDate;
    private Double maxPoints;
    private Long subjectId;
    private Instant createdAt;
    private Instant updatedAt;
}
