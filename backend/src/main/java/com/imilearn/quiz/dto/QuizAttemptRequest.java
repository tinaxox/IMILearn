package com.imilearn.quiz.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizAttemptRequest {

    @NotNull
    private List<Integer> answers;
}
