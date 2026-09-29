package com.imilearn.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignmentRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    private Instant dueDate;

    @Positive
    private Double maxPoints;

    @NotNull
    private Long subjectId;
}
