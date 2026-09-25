package com.imilearn.notification;

import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId, Pageable pageable);

    long countByRecipientIdAndReadAtIsNull(Long recipientId);

    @Modifying
    @Query("update Notification n set n.readAt = :readAt where n.recipient.id = :recipientId and n.readAt is null")
    int markAllReadForRecipient(@Param("recipientId") Long recipientId, @Param("readAt") Instant readAt);

    @Modifying
    @Query("update Notification n set n.readAt = coalesce(n.readAt, :readAt) where n.id = :id and n.recipient.id = :recipientId")
    int markReadForRecipient(@Param("id") Long id, @Param("recipientId") Long recipientId, @Param("readAt") Instant readAt);

    @Modifying
    @Query("delete from Notification n where n.id = :id and n.recipient.id = :recipientId")
    int deleteByIdForRecipient(@Param("id") Long id, @Param("recipientId") Long recipientId);
}
