package com.imilearn.notification;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.notification.dto.NotificationResponse;
import com.imilearn.user.User;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Async("notificationExecutor")
    public void notify(List<User> recipients, NotificationType type, String title, String message, Long subjectId,
            Long referenceId) {
        List<Notification> notifications = recipients.stream()
                .map(recipient -> Notification.builder().recipient(recipient).type(type).title(title)
                        .message(message).subjectId(subjectId).referenceId(referenceId).readAt(null).build())
                .toList();

        for (Notification notification : notificationRepository.saveAll(notifications)) {
            NotificationResponse response = notificationMapper.toResponse(notification);
            messagingTemplate.convertAndSendToUser(notification.getRecipient().getUsername(), "/queue/notifications",
                    response);
        }
    }

    @Override
    public Page<NotificationResponse> findForUser(User currentUser, Pageable pageable) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(notificationMapper::toResponse);
    }

    @Override
    public long unreadCount(User currentUser) {
        return notificationRepository.countByRecipientIdAndReadAtIsNull(currentUser.getId());
    }

    @Override
    public void markRead(Long notificationId, User currentUser) {
        int updated = notificationRepository.markReadForRecipient(notificationId, currentUser.getId(), Instant.now());
        if (updated == 0) {
            throw new ResourceNotFoundException("Notification not found: " + notificationId);
        }
    }

    @Override
    public void delete(Long notificationId, User currentUser) {
        int deleted = notificationRepository.deleteByIdForRecipient(notificationId, currentUser.getId());
        if (deleted == 0) {
            throw new ResourceNotFoundException("Notification not found: " + notificationId);
        }
    }

    @Override
    public void markAllRead(User currentUser) {
        notificationRepository.markAllReadForRecipient(currentUser.getId(), Instant.now());
    }
}
