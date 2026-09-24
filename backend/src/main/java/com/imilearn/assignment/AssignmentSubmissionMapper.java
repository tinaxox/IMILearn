package com.imilearn.assignment;

import com.imilearn.assignment.dto.AssignmentSubmissionResponse;
import com.imilearn.assignment.dto.SubmissionFileResponse;
import org.springframework.stereotype.Component;

@Component
public class AssignmentSubmissionMapper {

    public AssignmentSubmissionResponse toResponse(AssignmentSubmission submission) {
        return AssignmentSubmissionResponse.builder().id(submission.getId())
                .assignmentId(submission.getAssignment().getId()).studentId(submission.getStudent().getId())
                .studentEmail(submission.getStudent().getEmail())
                .studentName(submission.getStudent().getName()).studentSurname(submission.getStudent().getSurname())
                .points(submission.getPoints())
                .textContent(submission.getTextContent())
                .files(submission.getFiles().stream()
                        .map(file -> SubmissionFileResponse.builder().id(file.getId()).fileName(file.getFileName())
                                .storageKey(file.getStorageKey()).contentType(file.getContentType())
                                .sizeBytes(file.getSizeBytes()).createdAt(file.getCreatedAt()).build())
                        .toList())
                .createdAt(submission.getCreatedAt()).updatedAt(submission.getUpdatedAt()).build();
    }
}
