package com.imilearn.storage.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DownloadUrl {

    private String url;
    private Instant expiresAt;
}
