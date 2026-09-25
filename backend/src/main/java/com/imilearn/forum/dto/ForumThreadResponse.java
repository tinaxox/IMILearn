package com.imilearn.forum.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ForumThreadResponse {

    private Long id;
    private String title;
    private String body;
    private String attachmentStorageKey;
    private String attachmentFileName;
    private String attachmentContentType;
    private Long attachmentSizeBytes;
    private Long subjectId;
    private Long authorId;
    private String authorName;
    private Instant createdAt;
    private int postCount;
}
