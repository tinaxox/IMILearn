package com.imilearn.quiz;

import com.imilearn.quiz.dto.QuizRequest;
import com.imilearn.quiz.dto.QuizResponse;
import com.imilearn.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<QuizResponse>> findBySubject(@RequestParam Long subject, Pageable pageable, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizService.findBySubject(subject, pageable, currentUser));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizResponse> findById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizService.findById(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizResponse> create(@Valid @RequestBody QuizRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuizResponse> update(@PathVariable Long id, @Valid @RequestBody QuizRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(quizService.update(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        quizService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
