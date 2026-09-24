package com.imilearn.quiz;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {

    List<QuizSubmission> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<QuizSubmission> findByIdAndUserId(Long id, Long userId);
}
