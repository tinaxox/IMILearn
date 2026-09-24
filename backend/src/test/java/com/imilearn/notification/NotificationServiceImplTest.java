package com.imilearn.notification;

import static com.imilearn.TestFixtures.user;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.imilearn.user.UserType;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

class NotificationServiceImplTest {

    @Test
    void studentCanDeleteOnlyTheirNotification() {
        NotificationRepository notifications = mock(NotificationRepository.class);
        when(notifications.deleteByIdForRecipient(50L, 11L)).thenReturn(1);
        NotificationServiceImpl service = new NotificationServiceImpl(notifications, new NotificationMapper(), mock(SimpMessagingTemplate.class));

        service.delete(50L, user(11L, UserType.STUDENT));

        verify(notifications).deleteByIdForRecipient(50L, 11L);
    }
}
