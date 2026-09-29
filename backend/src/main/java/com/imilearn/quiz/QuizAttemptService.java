package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizAttemptRequest;
import com.imilearn.quiz.dto.QuizAttemptResponse;
import com.imilearn.user.User;
import java.util.List;
import java.util.Optional;

public interface QuizAttemptService {

    QuizAttemptResponse saveDraft(Long quizId, QuizAttemptRequest request, User currentUser);

    Optional<QuizAttemptResponse> findDraft(Long quizId, User currentUser);

    List<QuizAttemptResponse> findMine(User currentUser);
}
