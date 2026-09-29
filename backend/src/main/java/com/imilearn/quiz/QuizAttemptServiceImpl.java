package com.imilearn.quiz;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.quiz.dto.QuizAttemptRequest;
import com.imilearn.quiz.dto.QuizAttemptResponse;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.user.User;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAttemptMapper quizAttemptMapper;
    private final SubjectAccessService subjectAccessService;

    @Override
    public QuizAttemptResponse saveDraft(Long quizId, QuizAttemptRequest request, User currentUser) {
        Quiz quiz = getActiveQuiz(quizId);
        subjectAccessService.checkAccess(quiz.getSubject(), currentUser);

        QuizAttempt attempt = quizAttemptRepository.findByQuizIdAndUserId(quizId, currentUser.getId())
                .orElseGet(() -> QuizAttempt.builder().quiz(quiz).user(currentUser).build());
        attempt.setAnswers(request.getAnswers());

        return quizAttemptMapper.toResponse(quizAttemptRepository.save(attempt));
    }

    @Override
    public Optional<QuizAttemptResponse> findDraft(Long quizId, User currentUser) {
        return quizAttemptRepository.findByQuizIdAndUserId(quizId, currentUser.getId()).map(quizAttemptMapper::toResponse);
    }

    @Override
    public List<QuizAttemptResponse> findMine(User currentUser) {
        return quizAttemptRepository.findByUserId(currentUser.getId()).stream().map(quizAttemptMapper::toResponse).toList();
    }

    private Quiz getActiveQuiz(Long id) {
        return quizRepository.findById(id).filter(quiz -> quiz.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + id));
    }
}
