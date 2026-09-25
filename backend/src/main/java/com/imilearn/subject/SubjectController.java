package com.imilearn.subject;

import com.imilearn.subject.dto.SubjectRequest;
import com.imilearn.subject.dto.SubjectResponse;
import com.imilearn.user.User;
import com.imilearn.user.dto.UserResponse;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SubjectResponse>> findAll(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(subjectService.findAll(currentUser));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SubjectResponse> findById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(subjectService.findById(id, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<SubjectResponse> create(@Valid @RequestBody SubjectRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<SubjectResponse> update(@PathVariable Long id, @Valid @RequestBody SubjectRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(subjectService.update(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        subjectService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<UserResponse>> listMembers(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(subjectService.listMembers(id, currentUser));
    }

    @PostMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<List<UserResponse>> addMember(@PathVariable Long id, @PathVariable Long userId, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(subjectService.addMember(id, userId, currentUser));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<List<UserResponse>> removeMember(@PathVariable Long id, @PathVariable Long userId, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(subjectService.removeMember(id, userId, currentUser));
    }
}
