package com.imilearn.storage;

import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.storage.dto.UploadUrl;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Presigner s3Presigner;
    private final S3Client s3Client;
    private final StorageProperties storageProperties;

    public UploadUrl createUploadUrl(String keyPrefix, String fileName, String contentType, long sizeBytes) {
        if (sizeBytes <= 0 || sizeBytes > storageProperties.getMaxFileSizeMb() * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "File exceeds maximum allowed size of " + storageProperties.getMaxFileSizeMb() + "MB");
        }
        String key = keyPrefix + "/" + java.util.UUID.randomUUID() + "-" + sanitize(fileName);
        Duration duration = Duration.ofMinutes(storageProperties.getPresignExpirationMinutes());
        PutObjectRequest putObjectRequest = PutObjectRequest.builder().bucket(storageProperties.getBucket()).key(key)
                .contentType(contentType).build();
        String url = s3Presigner.presignPutObject(PutObjectPresignRequest.builder().signatureDuration(duration)
                .putObjectRequest(putObjectRequest).build()).url().toString();

        return UploadUrl.builder().url(url).storageKey(key).expiresAt(Instant.now().plus(duration)).build();
    }

    public DownloadUrl createDownloadUrl(String storageKey) {
        Duration duration = Duration.ofMinutes(storageProperties.getPresignExpirationMinutes());
        GetObjectRequest getObjectRequest = GetObjectRequest.builder().bucket(storageProperties.getBucket())
                .key(storageKey).build();
        String url = s3Presigner.presignGetObject(GetObjectPresignRequest.builder().signatureDuration(duration)
                .getObjectRequest(getObjectRequest).build()).url().toString();

        return DownloadUrl.builder().url(url).expiresAt(Instant.now().plus(duration)).build();
    }

    public byte[] downloadObject(String storageKey) {
        GetObjectRequest request = GetObjectRequest.builder().bucket(storageProperties.getBucket()).key(storageKey)
                .build();

        return s3Client.getObjectAsBytes(request).asByteArray();
    }

    private String sanitize(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
