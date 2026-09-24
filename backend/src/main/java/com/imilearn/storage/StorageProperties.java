package com.imilearn.storage;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    private String endpoint;
    private String region;
    private String accessKey;
    private String secretKey;
    private String bucket;
    private long presignExpirationMinutes;
    private long maxFileSizeMb;
}
