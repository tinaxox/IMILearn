package com.imilearn.quiz.dto;

import com.imilearn.quiz.GenerationStatus;
import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class QuizGenerationStatusResponse {

    private Long id;
    private String title;
    private Long subjectId;
    private GenerationStatus status;
    private Long resultQuizId;
    private String errorMessage;
    private List<QuizGenerationStepResponse> materialSteps;
    private Instant createdAt;
    private Instant updatedAt;
}
