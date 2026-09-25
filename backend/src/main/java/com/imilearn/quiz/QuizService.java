package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizRequest;
import com.imilearn.quiz.dto.QuizResponse;
import com.imilearn.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface QuizService {

    Page<QuizResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser);

    QuizResponse findById(Long id, User currentUser);

    QuizResponse create(QuizRequest request, User currentUser);

    QuizResponse update(Long id, QuizRequest request, User currentUser);

    void delete(Long id, User currentUser);
}
