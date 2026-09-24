package com.imilearn.storage;

import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CORSConfiguration;
import software.amazon.awssdk.services.s3.model.CORSRule;
import software.amazon.awssdk.services.s3.model.PutBucketCorsRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@EnableConfigurationProperties(StorageProperties.class)
@RequiredArgsConstructor
public class StorageConfig {

    private final StorageProperties properties;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder().endpointOverride(URI.create(properties.getEndpoint()))
                .region(Region.of(properties.getRegion())).credentialsProvider(credentialsProvider())
                .serviceConfiguration(s3Configuration()).build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder().endpointOverride(URI.create(properties.getEndpoint()))
                .region(Region.of(properties.getRegion())).credentialsProvider(credentialsProvider())
                .serviceConfiguration(s3Configuration()).build();
    }

    @Bean
    public ApplicationRunner configureBucketCors(S3Client s3Client) {
        return (ApplicationArguments args) -> s3Client
                .putBucketCors(PutBucketCorsRequest.builder().bucket(properties.getBucket())
                        .corsConfiguration(CORSConfiguration.builder()
                                .corsRules(CORSRule.builder().allowedOrigins("*").allowedMethods("GET", "PUT", "HEAD")
                                        .allowedHeaders("*").exposeHeaders("ETag").maxAgeSeconds(3000).build())
                                .build())
                        .build());
    }

    private StaticCredentialsProvider credentialsProvider() {
        return StaticCredentialsProvider
                .create(AwsBasicCredentials.create(properties.getAccessKey(), properties.getSecretKey()));
    }

    private S3Configuration s3Configuration() {
        return S3Configuration.builder().pathStyleAccessEnabled(true).build();
    }
}
