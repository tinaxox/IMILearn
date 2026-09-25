package com.imilearn.forum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForumThreadRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String body;

    private String attachmentStorageKey;
    private String attachmentFileName;
    private String attachmentContentType;
    private Long attachmentSizeBytes;
}
