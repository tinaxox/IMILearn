package com.imilearn.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmissionUploadUrlRequest {
    @NotBlank
    private String fileName;
    @NotBlank
    private String contentType;
    @NotNull
    @Positive
    private Long sizeBytes;
}
