package com.imilearn.material;

import com.imilearn.material.dto.MaterialRequest;
import com.imilearn.material.dto.MaterialResponse;
import com.imilearn.material.dto.MaterialUploadUrlRequest;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.storage.dto.UploadUrl;
import com.imilearn.user.User;
import jakarta.validation.Valid;
import java.util.List;
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
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class MaterialController {

    private final MaterialService materialService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<MaterialResponse>> findBySubject(@RequestParam Long subject, Pageable pageable, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(materialService.findBySubject(subject, pageable, currentUser));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MaterialResponse> findById(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(materialService.findById(id, currentUser));
    }

    @GetMapping("/recently-viewed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MaterialResponse>> findRecentlyViewed(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(materialService.findRecentlyViewed(currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<MaterialResponse> create(@Valid @RequestBody MaterialRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(materialService.create(request, currentUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<MaterialResponse> update(@PathVariable Long id, @Valid @RequestBody MaterialRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(materialService.update(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        materialService.delete(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-url")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<UploadUrl> createUploadUrl(@Valid @RequestBody MaterialUploadUrlRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(materialService.createUploadUrl(request, currentUser));
    }

    @GetMapping("/{id}/download-url")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DownloadUrl> createDownloadUrl(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(materialService.createDownloadUrl(id, currentUser));
    }
}
