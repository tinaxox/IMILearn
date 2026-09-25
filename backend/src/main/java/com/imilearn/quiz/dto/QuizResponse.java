package com.imilearn.quiz.dto;

import com.imilearn.quiz.question.QuizQuestion;
import java.time.Instant;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class QuizResponse {

    private Long id;
    private String title;
    private Long subjectId;
    private Long createdByUserId;
    private List<QuizQuestion> questions;
    private Instant createdAt;
    private Instant updatedAt;
}
