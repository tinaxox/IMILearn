package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizSubmissionResponse;
import com.imilearn.quiz.dto.SubmitQuizRequest;
import com.imilearn.user.User;
import java.util.List;

public interface QuizSubmissionService {

    QuizSubmissionResponse submit(Long quizId, SubmitQuizRequest request, User currentUser);

    List<QuizSubmissionResponse> findMine(User currentUser);

    QuizSubmissionResponse findMineById(Long submissionId, User currentUser);
}
