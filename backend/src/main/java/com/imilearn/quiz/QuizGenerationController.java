package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizGenerationRequest;
import com.imilearn.quiz.dto.QuizGenerationStatusResponse;
import com.imilearn.user.User;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/quizzes/generate")
@RequiredArgsConstructor
public class QuizGenerationController {

    private final QuizGenerationService quizGenerationService;

    @GetMapping("")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QuizGenerationStatusResponse>> listMine(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizGenerationService.listMine(currentUser));
    }

    @PostMapping("")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizGenerationStatusResponse> create(@Valid @RequestBody QuizGenerationRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(quizGenerationService.createRequest(request, currentUser));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizGenerationStatusResponse> getStatus(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizGenerationService.getStatus(id, currentUser));
    }
}
