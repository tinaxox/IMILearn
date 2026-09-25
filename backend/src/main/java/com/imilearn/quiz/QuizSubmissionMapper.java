package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizSubmissionResponse;
import org.springframework.stereotype.Component;

@Component
public class QuizSubmissionMapper {

    public QuizSubmissionResponse toResponse(QuizSubmission submission) {
        return QuizSubmissionResponse.builder().id(submission.getId()).quizId(submission.getQuiz().getId())
                .quizTitle(submission.getQuiz().getTitle()).score(submission.getScore())
                .correctCount(submission.getCorrectCount())
                .totalQuestions(submission.getTotalQuestions()).result(submission.getResult())
                .createdAt(submission.getCreatedAt()).build();
    }
}
