package com.imilearn.quiz.dto;

import com.imilearn.quiz.GenerationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class QuizGenerationStepResponse {

    private Long materialId;
    private GenerationStatus status;
    private int retryCount;
    private String errorMessage;
}
