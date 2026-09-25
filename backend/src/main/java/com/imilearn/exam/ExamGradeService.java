package com.imilearn.exam;

import com.imilearn.exam.dto.ExamGradeRequest;
import com.imilearn.exam.dto.ExamGradeResponse;
import com.imilearn.exam.dto.StudentExamGradeResponse;
import com.imilearn.user.User;
import java.util.List;

public interface ExamGradeService {
    ExamGradeResponse gradeStudent(Long examId, Long studentId, ExamGradeRequest request, User currentUser);

    List<ExamGradeResponse> findGradesForExam(Long examId, User currentUser);

    List<StudentExamGradeResponse> findMyGradesForSubject(Long subjectId, User currentUser);
}
