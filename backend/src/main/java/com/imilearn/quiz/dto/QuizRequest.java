package com.imilearn.quiz.dto;

import com.imilearn.quiz.question.QuizQuestion;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizRequest {

    @NotBlank
    private String title;

    @NotNull
    private Long subjectId;

    @NotEmpty
    @Valid
    private List<QuizQuestion> questions;

    @NotEmpty
    private List<Integer> correctOptionIndexes;
}
