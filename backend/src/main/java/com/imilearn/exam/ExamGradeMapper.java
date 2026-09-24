package com.imilearn.exam;

import com.imilearn.exam.dto.ExamGradeResponse;
import com.imilearn.exam.dto.StudentExamGradeResponse;
import com.imilearn.user.User;
import org.springframework.stereotype.Component;

@Component
public class ExamGradeMapper {

    public ExamGradeResponse toResponse(Long examId, User student, ExamGrade result) {
        return ExamGradeResponse.builder().examId(examId).studentId(student.getId()).studentEmail(student.getEmail())
                .studentName(student.getName()).studentSurname(student.getSurname()).studentIndex(student.getIndex())
                .studentYear(student.getYear()).points(result == null ? null : result.getPoints())
                .grade(result == null ? null : result.getGrade()).build();
    }

    public StudentExamGradeResponse toStudentResponse(Exam exam, ExamGrade result) {
        return StudentExamGradeResponse.builder().examId(exam.getId()).examName(exam.getName()).examDate(exam.getDate())
                .examType(exam.getType()).maxPoints(exam.getMaxPoints())
                .points(result == null ? null : result.getPoints()).grade(result == null ? null : result.getGrade())
                .build();
    }
}
