package com.imilearn.quiz;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Page<Quiz> findBySubjectIdAndDeletedAtIsNull(Long subjectId, Pageable pageable);
}
