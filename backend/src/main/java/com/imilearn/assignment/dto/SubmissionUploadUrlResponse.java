package com.imilearn.assignment.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SubmissionUploadUrlResponse {
    private String url;
    private String storageKey;
    private Instant expiresAt;
}
