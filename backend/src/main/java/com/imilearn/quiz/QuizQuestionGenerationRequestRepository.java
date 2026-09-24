package com.imilearn.quiz;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionGenerationRequestRepository extends JpaRepository<QuizQuestionGenerationRequest, Long> {

    List<QuizQuestionGenerationRequest> findByStatusIn(List<GenerationStatus> statuses);

    List<QuizQuestionGenerationRequest> findByRequestedByIdOrderByCreatedAtDesc(Long requestedById);

    List<QuizQuestionGenerationRequest> findAllByOrderByCreatedAtDesc();
}
