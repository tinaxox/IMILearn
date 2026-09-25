package com.imilearn.quiz.dto;

import com.imilearn.quiz.question.QuestionResult;
import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class QuizSubmissionResponse {

    private Long id;
    private Long quizId;
    private String quizTitle;
    private Double score;
    private Integer correctCount;
    private Integer totalQuestions;
    private List<QuestionResult> result;
    private Instant createdAt;
}
