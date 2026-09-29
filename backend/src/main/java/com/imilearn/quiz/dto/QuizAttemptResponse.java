package com.imilearn.quiz.dto;

import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class QuizAttemptResponse {

    private Long quizId;
    private List<Integer> answers;
    private Instant updatedAt;
}
