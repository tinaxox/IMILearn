package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizSubmissionResponse;
import com.imilearn.quiz.dto.SubmitQuizRequest;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizSubmissionController {

    private final QuizSubmissionService quizSubmissionService;

    @PostMapping("/{quizId}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizSubmissionResponse> submit(@PathVariable Long quizId, @Valid @RequestBody SubmitQuizRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizSubmissionService.submit(quizId, request, currentUser));
    }

    @GetMapping("/submissions/mine")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QuizSubmissionResponse>> findMine(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizSubmissionService.findMine(currentUser));
    }

    @GetMapping("/submissions/{submissionId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizSubmissionResponse> findMineById(@PathVariable Long submissionId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizSubmissionService.findMineById(submissionId, currentUser));
    }
}
