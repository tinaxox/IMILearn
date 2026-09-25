package com.imilearn.exam;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamGradeRepository extends JpaRepository<ExamGrade, Long> {

    List<ExamGrade> findByExamId(Long examId);

    Optional<ExamGrade> findByExamIdAndStudentId(Long examId, Long studentId);

    List<ExamGrade> findByStudentIdAndExamIdIn(Long studentId, List<Long> examIds);
}
