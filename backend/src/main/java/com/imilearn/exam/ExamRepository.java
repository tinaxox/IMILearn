package com.imilearn.exam;

import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, Long> {

    Page<Exam> findBySubjectIdAndDeletedAtIsNull(Long subjectId, Pageable pageable);

    List<Exam> findBySubjectIdAndDeletedAtIsNullOrderByDateAsc(Long subjectId);

    List<Exam> findByDeletedAtIsNullOrderByDateAsc();

    List<Exam> findByDeletedAtIsNullAndSubjectUsersIdAndSubjectUsersDeletedAtIsNullOrderByDateAsc(Long userId);

    List<Exam> findTop10ByDeletedAtIsNullAndDateAfterOrderByDateAsc(Instant date);

    List<Exam> findTop10ByDeletedAtIsNullAndDateAfterAndSubjectUsersIdAndSubjectUsersDeletedAtIsNullOrderByDateAsc(
            Instant date, Long userId);
}
