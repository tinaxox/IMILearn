package com.imilearn.assignment;

import com.imilearn.assignment.dto.AssignmentSubmissionResponse;
import com.imilearn.assignment.dto.GradeSubmissionRequest;
import com.imilearn.assignment.dto.SubmissionUploadUrlRequest;
import com.imilearn.assignment.dto.SubmissionUploadUrlResponse;
import com.imilearn.assignment.dto.SubmitAssignmentRequest;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.user.User;
import java.util.List;

public interface AssignmentSubmissionService {
    SubmissionUploadUrlResponse createUploadUrl(Long assignmentId, SubmissionUploadUrlRequest request, User currentUser);

    AssignmentSubmissionResponse submit(Long assignmentId, SubmitAssignmentRequest request, User currentUser);

    AssignmentSubmissionResponse findMine(Long assignmentId, User currentUser);

    List<AssignmentSubmissionResponse> findAllForAssignment(Long assignmentId, User currentUser);

    AssignmentSubmissionResponse gradeSubmission(Long submissionId, GradeSubmissionRequest request, User currentUser);

    DownloadUrl createFileDownloadUrl(Long fileId, User currentUser);
}
