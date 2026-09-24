package com.imilearn.forum;

import com.imilearn.forum.dto.ForumThreadRequest;
import com.imilearn.forum.dto.ForumThreadResponse;
import com.imilearn.material.dto.MaterialUploadUrlRequest;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.storage.dto.UploadUrl;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ForumThreadController {

    private final ForumThreadService forumThreadService;

    @GetMapping("/subjects/{subjectId}/forum/threads")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ForumThreadResponse>> findBySubject(@PathVariable Long subjectId, Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(forumThreadService.findBySubject(subjectId, pageable, currentUser));
    }

    @PostMapping("/subjects/{subjectId}/forum/threads")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ForumThreadResponse> create(@PathVariable Long subjectId,
            @Valid @RequestBody ForumThreadRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(forumThreadService.create(subjectId, request, currentUser));
    }

    @PostMapping("/forum/upload-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UploadUrl> createUploadUrl(@Valid @RequestBody MaterialUploadUrlRequest request) {
        return ResponseEntity.ok(forumThreadService.createUploadUrl(request));
    }

    @GetMapping("/forum/threads/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ForumThreadResponse> findById(@PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(forumThreadService.findById(id, currentUser));
    }

    @GetMapping("/forum/threads/{id}/attachment-download-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DownloadUrl> createAttachmentDownloadUrl(@PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(forumThreadService.createAttachmentDownloadUrl(id, currentUser));
    }

    @PatchMapping("/forum/threads/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ForumThreadResponse> update(@PathVariable Long id,
            @Valid @RequestBody ForumThreadRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(forumThreadService.update(id, request, currentUser));
    }

    @DeleteMapping("/forum/threads/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        forumThreadService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
