package com.imilearn.quiz.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionResult {

    private int questionIndex;
    private int correctOptionIndex;
    private Integer submittedOptionIndex;
    private boolean correct;
}
