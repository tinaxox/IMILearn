package com.imilearn.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizGenerationRequest {

    @NotEmpty
    private List<Long> materialIds;

    @NotNull
    @Positive
    private Integer questionCount;

    @NotBlank
    private String title;
}
