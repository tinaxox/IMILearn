package com.imilearn.exam.dto;

import com.imilearn.exam.ExamType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamRequest {

    @NotBlank
    private String name;

    @NotNull
    private Instant date;

    @NotNull
    private ExamType type;

    @Positive
    private Double maxPoints;

    @NotNull
    private Long subjectId;
}
