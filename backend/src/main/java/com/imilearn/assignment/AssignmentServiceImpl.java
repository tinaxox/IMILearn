package com.imilearn.assignment;

import com.imilearn.assignment.dto.AssignmentMaxPointsRequest;
import com.imilearn.assignment.dto.AssignmentRequest;
import com.imilearn.assignment.dto.AssignmentResponse;
import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.notification.NotificationService;
import com.imilearn.notification.NotificationType;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.user.User;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubjectAccessService subjectAccessService;
    private final AssignmentMapper assignmentMapper;
    private final NotificationService notificationService;

    @Override
    public Page<AssignmentResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser) {
        subjectAccessService.getAccessibleSubject(subjectId, currentUser);

        return assignmentRepository.findBySubjectIdAndDeletedAtIsNull(subjectId, pageable)
                .map(assignmentMapper::toResponse);
    }

    @Override
    public AssignmentResponse findById(Long id, User currentUser) {
        Assignment assignment = getActiveAssignment(id);
        subjectAccessService.checkAccess(assignment.getSubject(), currentUser);

        return assignmentMapper.toResponse(assignment);
    }

    @Override
    public AssignmentResponse create(AssignmentRequest request, User currentUser) {
        Subject subject = subjectAccessService.getAccessibleSubject(request.getSubjectId(), currentUser);

        Assignment assignment = assignmentRepository.save(Assignment.builder().title(request.getTitle())
                .description(request.getDescription()).dueDate(request.getDueDate()).subject(subject).build());
        notificationService.notify(subject.getUsers().stream()
                        .filter(user -> user.getType() == com.imilearn.user.UserType.STUDENT).toList(),
                NotificationType.ASSIGNMENT_CREATED, "New assignment: " + assignment.getTitle(),
                "A new assignment was posted in " + subject.getName(), subject.getId(), assignment.getId());

        return assignmentMapper.toResponse(assignment);
    }

    @Override
    public AssignmentResponse update(Long id, AssignmentRequest request, User currentUser) {
        Assignment assignment = getActiveAssignment(id);
        subjectAccessService.checkAccess(assignment.getSubject(), currentUser);

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setDueDate(request.getDueDate());
        if (!request.getSubjectId().equals(assignment.getSubject().getId())) {
            assignment.setSubject(subjectAccessService.getAccessibleSubject(request.getSubjectId(), currentUser));
        }

        return assignmentMapper.toResponse(assignmentRepository.save(assignment));
    }

    @Override
    public AssignmentResponse updateMaxPoints(Long id, AssignmentMaxPointsRequest request, User currentUser) {
        Assignment assignment = getActiveAssignment(id);
        subjectAccessService.checkAccess(assignment.getSubject(), currentUser);
        assignment.setMaxPoints(request.getMaxPoints());
        return assignmentMapper.toResponse(assignmentRepository.save(assignment));
    }

    @Override
    public void delete(Long id, User currentUser) {
        Assignment assignment = getActiveAssignment(id);
        subjectAccessService.checkAccess(assignment.getSubject(), currentUser);

        assignment.setDeletedAt(Instant.now());
        assignmentRepository.save(assignment);
    }

    private Assignment getActiveAssignment(Long id) {
        return assignmentRepository.findById(id).filter(assignment -> assignment.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + id));
    }

}
