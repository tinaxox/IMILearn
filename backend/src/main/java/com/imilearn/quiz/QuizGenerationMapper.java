package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizGenerationStatusResponse;
import com.imilearn.quiz.dto.QuizGenerationStepResponse;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class QuizGenerationMapper {

    public QuizGenerationStatusResponse toResponse(QuizQuestionGenerationRequest request, List<QuizQuestionMaterialGeneration> materialGenerations) {
        List<QuizGenerationStepResponse> steps = materialGenerations
                .stream().map(g -> QuizGenerationStepResponse.builder().materialId(g.getMaterial().getId())
                        .status(g.getStatus()).retryCount(g.getRetryCount()).errorMessage(g.getErrorMessage()).build())
                .toList();
        return QuizGenerationStatusResponse.builder().id(request.getId()).title(request.getTitle())
                .subjectId(request.getSubject().getId()).status(request.getStatus())
                .resultQuizId(request.getResultQuizId()).errorMessage(request.getErrorMessage()).materialSteps(steps)
                .createdAt(request.getCreatedAt()).updatedAt(request.getUpdatedAt()).build();
    }
}
