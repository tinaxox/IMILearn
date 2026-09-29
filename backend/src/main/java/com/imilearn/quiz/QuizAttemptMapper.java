package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizAttemptResponse;
import org.springframework.stereotype.Component;

@Component
public class QuizAttemptMapper {

    public QuizAttemptResponse toResponse(QuizAttempt attempt) {
        return QuizAttemptResponse.builder().quizId(attempt.getQuiz().getId()).answers(attempt.getAnswers())
                .updatedAt(attempt.getUpdatedAt()).build();
    }
}
