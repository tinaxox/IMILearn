package com.imilearn.exam;

import com.imilearn.exam.dto.ExamResponse;
import org.springframework.stereotype.Component;

@Component
public class ExamMapper {

    public ExamResponse toResponse(Exam exam) {
        return ExamResponse.builder().id(exam.getId()).name(exam.getName()).date(exam.getDate())
                .type(exam.getType()).maxPoints(exam.getMaxPoints())
                .subjectId(exam.getSubject().getId()).subjectName(exam.getSubject().getName())
                .createdAt(exam.getCreatedAt()).updatedAt(exam.getUpdatedAt()).build();
    }
}
