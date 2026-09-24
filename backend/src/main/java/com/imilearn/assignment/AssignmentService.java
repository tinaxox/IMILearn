package com.imilearn.assignment;

import com.imilearn.assignment.dto.AssignmentMaxPointsRequest;
import com.imilearn.assignment.dto.AssignmentRequest;
import com.imilearn.assignment.dto.AssignmentResponse;
import com.imilearn.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssignmentService {

    Page<AssignmentResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser);

    AssignmentResponse findById(Long id, User currentUser);

    AssignmentResponse create(AssignmentRequest request, User currentUser);

    AssignmentResponse update(Long id, AssignmentRequest request, User currentUser);

    AssignmentResponse updateMaxPoints(Long id, AssignmentMaxPointsRequest request, User currentUser);

    void delete(Long id, User currentUser);
}
