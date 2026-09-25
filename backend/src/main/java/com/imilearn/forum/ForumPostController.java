package com.imilearn.forum;

import com.imilearn.forum.dto.ForumPostRequest;
import com.imilearn.forum.dto.ForumPostResponse;
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
public class ForumPostController {

    private final ForumPostService forumPostService;

    @GetMapping("/forum/threads/{threadId}/posts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<ForumPostResponse>> findByThread(@PathVariable Long threadId, Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(forumPostService.findByThread(threadId, pageable, currentUser));
    }

    @PostMapping("/forum/threads/{threadId}/posts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ForumPostResponse> create(@PathVariable Long threadId,
            @Valid @RequestBody ForumPostRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(forumPostService.create(threadId, request, currentUser));
    }

    @PatchMapping("/forum/posts/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ForumPostResponse> update(@PathVariable Long id,
            @Valid @RequestBody ForumPostRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(forumPostService.update(id, request, currentUser));
    }

    @DeleteMapping("/forum/posts/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        forumPostService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }
}
