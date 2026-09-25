package com.imilearn.exam.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExamGradeRequest {
    @PositiveOrZero
    private Double points;

    @Min(5)
    @Max(10)
    private Integer grade;
}
