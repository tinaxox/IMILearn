package com.imilearn.assignment.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SubmissionFileResponse {
    private Long id;
    private String fileName;
    private String storageKey;
    private String contentType;
    private Long sizeBytes;
    private Instant createdAt;
}
