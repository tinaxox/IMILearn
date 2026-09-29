package com.imilearn.quiz;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    Optional<QuizAttempt> findByQuizIdAndUserId(Long quizId, Long userId);

    List<QuizAttempt> findByUserId(Long userId);

    void deleteByQuizIdAndUserId(Long quizId, Long userId);
}
