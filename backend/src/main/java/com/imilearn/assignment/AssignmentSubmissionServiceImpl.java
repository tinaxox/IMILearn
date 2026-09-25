package com.imilearn.assignment;

import com.imilearn.assignment.dto.AssignmentSubmissionResponse;
import com.imilearn.assignment.dto.GradeSubmissionRequest;
import com.imilearn.assignment.dto.SubmissionFileRequest;
import com.imilearn.assignment.dto.SubmissionUploadUrlRequest;
import com.imilearn.assignment.dto.SubmissionUploadUrlResponse;
import com.imilearn.assignment.dto.SubmitAssignmentRequest;
import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.notification.NotificationService;
import com.imilearn.notification.NotificationType;
import com.imilearn.storage.StorageService;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.storage.dto.UploadUrl;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.subject.SubjectRepository;
import com.imilearn.user.User;
import com.imilearn.user.UserType;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentSubmissionServiceImpl implements AssignmentSubmissionService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final SubmissionFileRepository submissionFileRepository;
    private final AssignmentSubmissionMapper assignmentSubmissionMapper;
    private final StorageService storageService;
    private final SubjectRepository subjectRepository;
    private final SubjectAccessService subjectAccessService;
    private final NotificationService notificationService;

    @Override
    public SubmissionUploadUrlResponse createUploadUrl(Long assignmentId, SubmissionUploadUrlRequest request, User currentUser) {
        getActiveAssignment(assignmentId);
        UploadUrl uploadUrl = storageService.createUploadUrl("submissions", request.getFileName(),
                request.getContentType(), request.getSizeBytes());

        return SubmissionUploadUrlResponse.builder().url(uploadUrl.getUrl()).storageKey(uploadUrl.getStorageKey())
                .expiresAt(uploadUrl.getExpiresAt()).build();
    }

    @Override
    public AssignmentSubmissionResponse submit(Long assignmentId, SubmitAssignmentRequest request, User currentUser) {
        Assignment assignment = getActiveAssignment(assignmentId);
        if (!subjectRepository.existsByIdAndUsersIdAndUsersDeletedAtIsNull(assignment.getSubject().getId(),
                currentUser.getId())) {
            throw new AccessDeniedException("Not enrolled in this subject");
        }
        if (Instant.now().isAfter(assignment.getDueDate())) {
            throw new IllegalArgumentException("Submission deadline has passed");
        }
        AssignmentSubmission submission = assignmentSubmissionRepository
                .findByAssignmentIdAndStudentId(assignmentId, currentUser.getId())
                .orElseGet(() -> AssignmentSubmission.builder().assignment(assignment).student(currentUser).build());
        submission.setTextContent(request.getTextContent());
        submission.getFiles().clear();
        for (SubmissionFileRequest fileRequest : request.getFiles()) {
            submission.getFiles()
                    .add(SubmissionFile.builder().submission(submission).fileName(fileRequest.getFileName())
                            .storageKey(fileRequest.getStorageKey()).contentType(fileRequest.getContentType())
                            .sizeBytes(fileRequest.getSizeBytes()).build());
        }

        return assignmentSubmissionMapper.toResponse(assignmentSubmissionRepository.save(submission));
    }

    @Override
    public AssignmentSubmissionResponse findMine(Long assignmentId, User currentUser) {
        return assignmentSubmissionMapper.toResponse(
                assignmentSubmissionRepository.findByAssignmentIdAndStudentId(assignmentId, currentUser.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("No submission found")));
    }

    @Override
    public List<AssignmentSubmissionResponse> findAllForAssignment(Long assignmentId, User currentUser) {
        Assignment assignment = getActiveAssignment(assignmentId);
        subjectAccessService.checkAccess(assignment.getSubject(), currentUser);

        return assignmentSubmissionRepository.findByAssignmentId(assignmentId).stream()
                .map(assignmentSubmissionMapper::toResponse).toList();
    }

    @Override
    public AssignmentSubmissionResponse gradeSubmission(Long submissionId, GradeSubmissionRequest request, User currentUser) {
        AssignmentSubmission submission = assignmentSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found: " + submissionId));
        subjectAccessService.checkAccess(submission.getAssignment().getSubject(), currentUser);
        Assignment assignment = submission.getAssignment();
        if (assignment.getMaxPoints() == null) {
            throw new IllegalArgumentException("Maximum points must be set before grading this assignment");
        }
        if (request.getPoints() > assignment.getMaxPoints()) {
            throw new IllegalArgumentException(
                    "Points cannot exceed assignment maximum of " + assignment.getMaxPoints());
        }
        submission.setPoints(request.getPoints());
        AssignmentSubmission gradedSubmission = assignmentSubmissionRepository.save(submission);
        notificationService.notify(List.of(gradedSubmission.getStudent()), NotificationType.ASSIGNMENT_GRADED,
                "Your assignment was graded: " + gradedSubmission.getAssignment().getTitle(),
                "You received " + gradedSubmission.getPoints() + " points",
                gradedSubmission.getAssignment().getSubject().getId(), gradedSubmission.getId());

        return assignmentSubmissionMapper.toResponse(gradedSubmission);
    }

    @Override
    public DownloadUrl createFileDownloadUrl(Long fileId, User currentUser) {
        SubmissionFile file = submissionFileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission file not found: " + fileId));
        boolean owner = file.getSubmission().getStudent().getId().equals(currentUser.getId());
        boolean professor = currentUser.getType() == UserType.PROFESSOR
                && subjectRepository.existsByIdAndUsersIdAndUsersDeletedAtIsNull(
                        file.getSubmission().getAssignment().getSubject().getId(), currentUser.getId());
        if (currentUser.getType() != UserType.ADMIN && !owner && !professor) {
            throw new AccessDeniedException("Not allowed to access this file");
        }

        return storageService.createDownloadUrl(file.getStorageKey());
    }

    private Assignment getActiveAssignment(Long id) {
        return assignmentRepository.findById(id).filter(assignment -> assignment.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + id));
    }

}
