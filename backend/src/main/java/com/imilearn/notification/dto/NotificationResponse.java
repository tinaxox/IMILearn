package com.imilearn.notification.dto;

import com.imilearn.notification.NotificationType;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Long subjectId;
    private Long referenceId;
    private boolean read;
    private Instant createdAt;
}
