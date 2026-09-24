package com.imilearn.quiz;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface QuizQuestionMaterialGenerationRepository extends JpaRepository<QuizQuestionMaterialGeneration, Long> {

    Optional<QuizQuestionMaterialGeneration> findByMaterialId(Long materialId);

    List<QuizQuestionMaterialGeneration> findByMaterialIdIn(List<Long> materialIds);

    long countByStatus(GenerationStatus status);

    List<QuizQuestionMaterialGeneration> findByStatusAndRetryCountLessThanOrderByCreatedAtAsc(GenerationStatus status, int retryCount);

    @Modifying
    @Query("update QuizQuestionMaterialGeneration g set g.status = :newStatus where g.status = :oldStatus and g.updatedAt < :threshold")
    int bulkResetStale(@Param("oldStatus") GenerationStatus oldStatus, @Param("newStatus") GenerationStatus newStatus,
            @Param("threshold") Instant threshold);
}
