package com.imilearn.quiz;

import com.imilearn.material.MaterialQuestionGenerationService;
import com.imilearn.material.MaterialQuestions;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class QuizGenerationWorker {

    private final QuizQuestionMaterialGenerationRepository materialGenerationRepository;
    private final MaterialQuestionGenerationService materialQuestionGenerationService;

    @Async("materialGenerationExecutor")
    public void processMaterial(Long generationId) {
        try {
            QuizQuestionMaterialGeneration generation = materialGenerationRepository.findById(generationId)
                    .orElseThrow();
            MaterialQuestions questions = materialQuestionGenerationService.generate(generation.getMaterial().getId());
            generation.setQuestions(questions.getQuestions());
            generation.setAnswers(questions.getAnswers());
            generation.setStatus(GenerationStatus.SUCCESS);
            generation.setErrorMessage(null);
            materialGenerationRepository.save(generation);
        } catch (Exception e) {
            materialGenerationRepository.findById(generationId).ifPresent(generation -> {
                generation.setRetryCount(generation.getRetryCount() + 1);
                generation.setErrorMessage(e.getMessage());
                generation.setStatus(GenerationStatus.FAILED);
                materialGenerationRepository.save(generation);
            });
        }
    }
}
