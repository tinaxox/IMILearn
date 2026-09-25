package com.imilearn.notification;

import com.imilearn.notification.dto.NotificationResponse;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder().id(notification.getId()).type(notification.getType())
                .title(notification.getTitle()).message(notification.getMessage())
                .subjectId(notification.getSubjectId()).referenceId(notification.getReferenceId())
                .read(notification.getReadAt() != null).createdAt(notification.getCreatedAt()).build();
    }
}
