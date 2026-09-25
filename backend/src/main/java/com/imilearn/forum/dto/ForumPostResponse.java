package com.imilearn.forum.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ForumPostResponse {

    private Long id;
    private Long threadId;
    private Long authorId;
    private String authorName;
    private String body;
    private Instant createdAt;
}
