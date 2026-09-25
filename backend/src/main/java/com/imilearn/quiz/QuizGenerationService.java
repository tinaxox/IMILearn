package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizGenerationRequest;
import com.imilearn.quiz.dto.QuizGenerationStatusResponse;
import com.imilearn.user.User;
import java.util.List;

public interface QuizGenerationService {

    QuizGenerationStatusResponse createRequest(QuizGenerationRequest request, User currentUser);

    QuizGenerationStatusResponse getStatus(Long id, User currentUser);

    List<QuizGenerationStatusResponse> listMine(User currentUser);
}
