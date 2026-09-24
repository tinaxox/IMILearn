package com.imilearn.assignment;

import com.imilearn.assignment.dto.AssignmentSubmissionResponse;
import com.imilearn.assignment.dto.SubmissionUploadUrlRequest;
import com.imilearn.assignment.dto.SubmissionUploadUrlResponse;
import com.imilearn.assignment.dto.SubmitAssignmentRequest;
import com.imilearn.assignment.dto.GradeSubmissionRequest;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.user.User;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentSubmissionController {

    private final AssignmentSubmissionService assignmentSubmissionService;

    @PostMapping("/{assignmentId}/submission/upload-url")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionUploadUrlResponse> createUploadUrl(@PathVariable Long assignmentId, @Valid @RequestBody SubmissionUploadUrlRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(assignmentSubmissionService.createUploadUrl(assignmentId, request, currentUser));
    }

    @PutMapping("/{assignmentId}/submission")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AssignmentSubmissionResponse> submit(@PathVariable Long assignmentId, @Valid @RequestBody SubmitAssignmentRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(assignmentSubmissionService.submit(assignmentId, request, currentUser));
    }

    @GetMapping("/{assignmentId}/submission")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AssignmentSubmissionResponse> findMine(@PathVariable Long assignmentId, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(assignmentSubmissionService.findMine(assignmentId, currentUser));
    }

    @GetMapping("/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<List<AssignmentSubmissionResponse>> findAllForAssignment(@PathVariable Long assignmentId, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(assignmentSubmissionService.findAllForAssignment(assignmentId, currentUser));
    }

    @PutMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<AssignmentSubmissionResponse> gradeSubmission(@PathVariable Long submissionId, @Valid @RequestBody GradeSubmissionRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(assignmentSubmissionService.gradeSubmission(submissionId, request, currentUser));
    }

    @GetMapping("/submission-files/{fileId}/download-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DownloadUrl> createFileDownloadUrl(@PathVariable Long fileId, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(assignmentSubmissionService.createFileDownloadUrl(fileId, currentUser));
    }
}
