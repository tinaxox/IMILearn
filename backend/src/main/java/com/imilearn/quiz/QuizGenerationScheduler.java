package com.imilearn.quiz;

import com.imilearn.quiz.question.QuizQuestion;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class QuizGenerationScheduler {

    private static final int MAX_CONCURRENT = 2;
    private static final int MAX_RETRIES = 3;
    private static final Duration STALE_THRESHOLD = Duration.ofMinutes(5);

    private final QuizQuestionMaterialGenerationRepository materialGenerationRepository;
    private final QuizQuestionGenerationRequestRepository requestRepository;
    private final QuizGenerationWorker worker;
    private final QuizRepository quizRepository;

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void recoverStaleRunning() {
        materialGenerationRepository.bulkResetStale(GenerationStatus.RUNNING, GenerationStatus.PENDING,
                Instant.now().minus(STALE_THRESHOLD));
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void dispatchPendingMaterials() {
        long running = materialGenerationRepository.countByStatus(GenerationStatus.RUNNING);
        int slots = (int) Math.max(0, MAX_CONCURRENT - running);
        if (slots == 0) {
            return;
        }
        List<QuizQuestionMaterialGeneration> toDispatch = materialGenerationRepository
                .findByStatusAndRetryCountLessThanOrderByCreatedAtAsc(GenerationStatus.PENDING, MAX_RETRIES).stream()
                .limit(slots).toList();
        toDispatch.forEach(generation -> generation.setStatus(GenerationStatus.RUNNING));
        materialGenerationRepository.saveAll(toDispatch);
        toDispatch.forEach(generation -> worker.processMaterial(generation.getId()));
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void checkRequestCompletion() {
        List<QuizQuestionGenerationRequest> requests = requestRepository
                .findByStatusIn(List.of(GenerationStatus.PENDING, GenerationStatus.RUNNING));
        if (requests.isEmpty()) {
            return;
        }

        Map<Long, List<QuizQuestionMaterialGeneration>> generationsByMaterialId = loadGenerationsByMaterialId(requests);

        List<QuizQuestionGenerationRequest> changed = requests.stream()
                .filter(request -> advanceRequest(request, generationsByMaterialId)).toList();
        requestRepository.saveAll(changed);
    }

    private Map<Long, List<QuizQuestionMaterialGeneration>> loadGenerationsByMaterialId(
            List<QuizQuestionGenerationRequest> requests) {
        List<Long> materialIds = requests.stream().flatMap(request -> request.getMaterialIds().stream()).distinct()
                .toList();
        return materialGenerationRepository.findByMaterialIdIn(materialIds).stream()
                .collect(Collectors.groupingBy(generation -> generation.getMaterial().getId()));
    }

    private boolean advanceRequest(QuizQuestionGenerationRequest request,
            Map<Long, List<QuizQuestionMaterialGeneration>> generationsByMaterialId) {
        boolean startedRunning = markRunningIfPending(request);

        List<QuizQuestionMaterialGeneration> generations = request.getMaterialIds().stream()
                .flatMap(id -> generationsByMaterialId.getOrDefault(id, List.of()).stream()).toList();

        if (markFailedIfAnyFailed(request, generations)) {
            return true;
        }
        return startedRunning || markSuccessIfComplete(request, generations);
    }

    private boolean markRunningIfPending(QuizQuestionGenerationRequest request) {
        if (request.getStatus() != GenerationStatus.PENDING) {
            return false;
        }
        request.setStatus(GenerationStatus.RUNNING);
        return true;
    }

    private boolean markFailedIfAnyFailed(QuizQuestionGenerationRequest request,
            List<QuizQuestionMaterialGeneration> generations) {
        QuizQuestionMaterialGeneration failed = generations.stream()
                .filter(generation -> generation.getStatus() == GenerationStatus.FAILED).findFirst().orElse(null);
        if (failed == null) {
            return false;
        }
        request.setStatus(GenerationStatus.FAILED);
        request.setErrorMessage("Question generation failed for material id " + failed.getMaterial().getId());
        return true;
    }

    private boolean markSuccessIfComplete(QuizQuestionGenerationRequest request,
            List<QuizQuestionMaterialGeneration> generations) {
        boolean allComplete = generations.size() == request.getMaterialIds().size() && generations.stream()
                .allMatch(generation -> generation.getStatus() == GenerationStatus.SUCCESS);
        if (!allComplete) {
            return false;
        }
        Quiz quiz = createQuiz(request, generations);
        request.setStatus(GenerationStatus.SUCCESS);
        request.setResultQuizId(quiz.getId());
        return true;
    }

    private record QuestionAnswer(QuizQuestion question, Integer correctOptionIndex) {
    }

    private Quiz createQuiz(QuizQuestionGenerationRequest request, List<QuizQuestionMaterialGeneration> materialGenerations) {
        List<QuestionAnswer> pool = new ArrayList<>();
        for (QuizQuestionMaterialGeneration generation : materialGenerations) {
            List<QuizQuestion> questions = generation.getQuestions();
            List<Integer> answers = generation.getAnswers();
            for (int i = 0; i < questions.size(); i++) {
                pool.add(new QuestionAnswer(questions.get(i), answers.get(i)));
            }
        }

        Collections.shuffle(pool);
        List<QuestionAnswer> sampled = pool.stream().limit(Math.min(request.getRequestedQuestionCount(), pool.size()))
                .toList();
        List<QuizQuestion> finalQuestions = sampled.stream().map(QuestionAnswer::question).toList();
        List<Integer> finalAnswers = sampled.stream().map(QuestionAnswer::correctOptionIndex).toList();

        return quizRepository.save(Quiz.builder().title(request.getTitle()).subject(request.getSubject())
                .createdBy(request.getRequestedBy()).questions(finalQuestions).answers(finalAnswers).build());
    }

}
