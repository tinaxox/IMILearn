package com.imilearn.storage.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UploadUrl {

    private String url;
    private String storageKey;
    private Instant expiresAt;
}
