package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizResponse;
import org.springframework.stereotype.Component;

@Component
public class QuizMapper {

    public QuizResponse toResponse(Quiz quiz) {
        return QuizResponse.builder().id(quiz.getId()).title(quiz.getTitle()).subjectId(quiz.getSubject().getId())
                .createdByUserId(quiz.getCreatedBy().getId()).questions(quiz.getQuestions())
                .createdAt(quiz.getCreatedAt()).updatedAt(quiz.getUpdatedAt()).build();
    }
}
