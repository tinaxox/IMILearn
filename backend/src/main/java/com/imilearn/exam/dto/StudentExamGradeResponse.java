package com.imilearn.exam.dto;

import com.imilearn.exam.ExamType;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StudentExamGradeResponse {
    private Long examId;
    private String examName;
    private Instant examDate;
    private ExamType examType;
    private Double maxPoints;
    private Double points;
    private Integer grade;
}
