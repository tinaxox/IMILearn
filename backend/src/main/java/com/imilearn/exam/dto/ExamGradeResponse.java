package com.imilearn.exam.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ExamGradeResponse {
    private Long examId;
    private Long studentId;
    private String studentEmail;
    private String studentName;
    private String studentSurname;
    private String studentIndex;
    private Integer studentYear;
    private Double points;
    private Integer grade;
}
