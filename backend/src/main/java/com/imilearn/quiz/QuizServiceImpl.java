package com.imilearn.quiz;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.quiz.dto.QuizRequest;
import com.imilearn.quiz.dto.QuizResponse;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.user.User;
import com.imilearn.user.UserType;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final SubjectAccessService subjectAccessService;
    private final QuizMapper quizMapper;

    @Override
    public Page<QuizResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser) {
        subjectAccessService.getAccessibleSubject(subjectId, currentUser);

        return quizRepository.findBySubjectIdAndDeletedAtIsNull(subjectId, pageable).map(quizMapper::toResponse);
    }

    @Override
    public QuizResponse findById(Long id, User currentUser) {
        Quiz quiz = getActiveQuiz(id);
        subjectAccessService.checkAccess(quiz.getSubject(), currentUser);

        return quizMapper.toResponse(quiz);
    }

    @Override
    public QuizResponse create(QuizRequest request, User currentUser) {
        Subject subject = subjectAccessService.getAccessibleSubject(request.getSubjectId(), currentUser);
        checkQuestionsMatchAnswers(request);

        return quizMapper.toResponse(
                quizRepository.save(Quiz.builder().title(request.getTitle()).subject(subject).createdBy(currentUser)
                        .questions(request.getQuestions()).answers(request.getCorrectOptionIndexes()).build()));
    }

    @Override
    public QuizResponse update(Long id, QuizRequest request, User currentUser) {
        Quiz quiz = getActiveQuiz(id);
        checkOwnerOrAdmin(quiz, currentUser);
        checkQuestionsMatchAnswers(request);

        quiz.setTitle(request.getTitle());
        quiz.setQuestions(request.getQuestions());
        quiz.setAnswers(request.getCorrectOptionIndexes());
        if (!request.getSubjectId().equals(quiz.getSubject().getId())) {
            quiz.setSubject(subjectAccessService.getAccessibleSubject(request.getSubjectId(), currentUser));
        }

        return quizMapper.toResponse(quizRepository.save(quiz));
    }

    @Override
    public void delete(Long id, User currentUser) {
        Quiz quiz = getActiveQuiz(id);
        checkOwnerOrAdmin(quiz, currentUser);

        quiz.setDeletedAt(Instant.now());
        quizRepository.save(quiz);
    }

    private void checkOwnerOrAdmin(Quiz quiz, User currentUser) {
        if (currentUser.getType() != UserType.ADMIN && !quiz.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Not the quiz owner");
        }
    }

    private void checkQuestionsMatchAnswers(QuizRequest request) {
        if (request.getQuestions().size() != request.getCorrectOptionIndexes().size()) {
            throw new IllegalArgumentException("correctOptionIndexes must have exactly one entry per question");
        }
    }

    private Quiz getActiveQuiz(Long id) {
        return quizRepository.findById(id).filter(quiz -> quiz.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + id));
    }

}
