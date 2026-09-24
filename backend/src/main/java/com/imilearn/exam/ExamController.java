package com.imilearn.exam;

import com.imilearn.exam.dto.ExamRequest;
import com.imilearn.exam.dto.ExamResponse;
import com.imilearn.exam.dto.ExamMaxPointsRequest;
import com.imilearn.user.User;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamController {

    private final ExamService examService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ExamResponse>> findBySubject(@RequestParam Long subject, Pageable pageable, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(examService.findBySubject(subject, pageable, currentUser));
    }

    @GetMapping("/all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ExamResponse>> findAllAccessible(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(examService.findAllAccessible(currentUser));
    }

    @GetMapping("/upcoming")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ExamResponse>> findUpcoming(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(examService.findUpcomingForCurrentUser(currentUser));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ExamResponse> findById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(examService.findById(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<ExamResponse> create(@Valid @RequestBody ExamRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<ExamResponse> update(@PathVariable Long id, @Valid @RequestBody ExamRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(examService.update(id, request, currentUser));
    }

    @PutMapping("/{id}/max-points")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<ExamResponse> updateMaxPoints(@PathVariable Long id,
            @Valid @RequestBody ExamMaxPointsRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(examService.updateMaxPoints(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        examService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
