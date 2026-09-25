package com.imilearn.notification;

import com.imilearn.notification.dto.NotificationResponse;
import com.imilearn.user.User;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    void notify(List<User> recipients, NotificationType type, String title, String message, Long subjectId,
            Long referenceId);

    Page<NotificationResponse> findForUser(User currentUser, Pageable pageable);

    long unreadCount(User currentUser);

    void markRead(Long notificationId, User currentUser);

    void delete(Long notificationId, User currentUser);

    void markAllRead(User currentUser);
}
