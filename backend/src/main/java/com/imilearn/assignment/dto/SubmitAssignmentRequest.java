package com.imilearn.assignment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubmitAssignmentRequest {
    @NotNull
    @Valid
    private List<SubmissionFileRequest> files;

    @Size(max = 10000)
    private String textContent;

    @AssertTrue(message = "Add text or at least one file")
    public boolean isContentPresent() {
        return (textContent != null && !textContent.isBlank()) || (files != null && !files.isEmpty());
    }
}
