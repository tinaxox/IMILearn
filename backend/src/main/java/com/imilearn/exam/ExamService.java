package com.imilearn.exam;

import com.imilearn.exam.dto.ExamRequest;
import com.imilearn.exam.dto.ExamResponse;
import com.imilearn.exam.dto.ExamMaxPointsRequest;
import com.imilearn.user.User;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ExamService {

    Page<ExamResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser);

    List<ExamResponse> findAllAccessible(User currentUser);

    ExamResponse findById(Long id, User currentUser);

    ExamResponse create(ExamRequest request, User currentUser);

    ExamResponse update(Long id, ExamRequest request, User currentUser);

    ExamResponse updateMaxPoints(Long id, ExamMaxPointsRequest request, User currentUser);

    void delete(Long id, User currentUser);

    List<ExamResponse> findUpcomingForCurrentUser(User currentUser);
}
