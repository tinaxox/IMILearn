package com.imilearn.quiz;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.quiz.dto.QuizSubmissionResponse;
import com.imilearn.quiz.dto.SubmitQuizRequest;
import com.imilearn.quiz.question.QuestionResult;
import com.imilearn.subject.Subject;
import com.imilearn.user.User;
import com.imilearn.user.UserType;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class QuizSubmissionServiceImpl implements QuizSubmissionService {

    private final QuizRepository quizRepository;
    private final QuizSubmissionRepository quizSubmissionRepository;
    private final QuizSubmissionMapper quizSubmissionMapper;

    @Override
    public QuizSubmissionResponse submit(Long quizId, SubmitQuizRequest request, User currentUser) {
        Quiz quiz = getActiveQuiz(quizId);
        checkMembership(quiz.getSubject(), currentUser);
        List<Integer> correctOptionIndexes = quiz.getAnswers();
        List<Integer> submittedOptionIndexes = request.getSubmittedOptionIndexes();

        List<QuestionResult> results = new ArrayList<>();
        int correctCount = 0;
        for (int i = 0; i < correctOptionIndexes.size(); i++) {
            int correctIndex = correctOptionIndexes.get(i);
            Integer submittedIndex = i < submittedOptionIndexes.size() ? submittedOptionIndexes.get(i) : null;
            boolean correct = Objects.equals(correctIndex, submittedIndex);
            if (correct) {
                correctCount++;
            }
            results.add(QuestionResult.builder().questionIndex(i).correctOptionIndex(correctIndex)
                    .submittedOptionIndex(submittedIndex).correct(correct).build());
        }
        int total = correctOptionIndexes.size();
        double score = total == 0 ? 0.0 : (correctCount * 100.0) / total;

        QuizSubmission submission = QuizSubmission.builder().quiz(quiz).user(currentUser)
                .submittedAnswers(submittedOptionIndexes).score(score).correctCount(correctCount).totalQuestions(total)
                .result(results).build();

        return quizSubmissionMapper.toResponse(quizSubmissionRepository.save(submission));
    }

    @Override
    public List<QuizSubmissionResponse> findMine(User currentUser) {
        return quizSubmissionRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId()).stream()
                .map(quizSubmissionMapper::toResponse).toList();
    }

    @Override
    public QuizSubmissionResponse findMineById(Long submissionId, User currentUser) {
        return quizSubmissionRepository.findByIdAndUserId(submissionId, currentUser.getId())
                .map(quizSubmissionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz submission not found: " + submissionId));
    }

    private void checkMembership(Subject subject, User currentUser) {
        if (currentUser.getType() != UserType.ADMIN && !subject.getUsers().stream()
                .anyMatch(user -> user.getId().equals(currentUser.getId()) && user.getDeletedAt() == null)) {
            throw new AccessDeniedException("Not a member of this subject");
        }
    }

    private Quiz getActiveQuiz(Long id) {
        return quizRepository.findById(id).filter(quiz -> quiz.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + id));
    }
}
