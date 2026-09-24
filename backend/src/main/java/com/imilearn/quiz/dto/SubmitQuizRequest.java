package com.imilearn.quiz.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitQuizRequest {

    @NotEmpty
    private List<Integer> submittedOptionIndexes;
}
