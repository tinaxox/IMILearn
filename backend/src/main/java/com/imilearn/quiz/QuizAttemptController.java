package com.imilearn.quiz;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.quiz.dto.QuizAttemptRequest;
import com.imilearn.quiz.dto.QuizAttemptResponse;
import com.imilearn.user.User;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;

    @PutMapping("/{quizId}/attempt")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizAttemptResponse> saveDraft(@PathVariable Long quizId, @Valid @RequestBody QuizAttemptRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizAttemptService.saveDraft(quizId, request, currentUser));
    }

    @GetMapping("/{quizId}/attempt")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizAttemptResponse> findDraft(@PathVariable Long quizId, @AuthenticationPrincipal User currentUser) {
        return quizAttemptService.findDraft(quizId, currentUser).map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("No quiz attempt in progress for quiz: " + quizId));
    }

    @GetMapping("/attempts/mine")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QuizAttemptResponse>> findMine(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizAttemptService.findMine(currentUser));
    }
}
