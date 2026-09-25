package com.imilearn.forum;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.forum.dto.ForumThreadRequest;
import com.imilearn.forum.dto.ForumThreadResponse;
import com.imilearn.material.dto.MaterialUploadUrlRequest;
import com.imilearn.notification.NotificationService;
import com.imilearn.notification.NotificationType;
import com.imilearn.storage.StorageService;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.storage.dto.UploadUrl;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.user.User;
import com.imilearn.user.UserType;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ForumThreadServiceImpl implements ForumThreadService {

    private final ForumThreadRepository forumThreadRepository;
    private final ForumPostRepository forumPostRepository;
    private final SubjectAccessService subjectAccessService;
    private final ForumThreadMapper forumThreadMapper;
    private final NotificationService notificationService;
    private final StorageService storageService;

    @Override
    public Page<ForumThreadResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser) {
        subjectAccessService.getAccessibleSubject(subjectId, currentUser);

        return forumThreadRepository.findBySubjectIdAndDeletedAtIsNull(subjectId, pageable)
                .map(this::toResponse);
    }

    @Override
    public ForumThreadResponse findById(Long threadId, User currentUser) {
        ForumThread thread = getActiveThread(threadId);
        subjectAccessService.checkAccess(thread.getSubject(), currentUser);

        return toResponse(thread);
    }

    @Override
    public ForumThreadResponse create(Long subjectId, ForumThreadRequest request, User currentUser) {
        Subject subject = subjectAccessService.getAccessibleSubject(subjectId, currentUser);
        ForumThread thread = forumThreadMapper.toEntity(request);
        thread.setSubject(subject);
        thread.setAuthor(currentUser);

        ForumThread savedThread = forumThreadRepository.save(thread);
        List<User> mentioned = MentionParser.findMentioned(request.getBody(), subject.getUsers(), currentUser);
        Set<Long> mentionedIds = mentioned.stream().map(User::getId).collect(Collectors.toSet());
        List<User> others = subject.getUsers().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> !mentionedIds.contains(user.getId()))
                .toList();

        if (!others.isEmpty()) {
            notificationService.notify(
                    others,
                    NotificationType.FORUM_THREAD_CREATED,
                    "New forum thread: " + savedThread.getTitle(),
                    currentUser.getName() + " posted a new thread in " + subject.getName(),
                    subject.getId(),
                    savedThread.getId());
        }
        if (!mentioned.isEmpty()) {
            notificationService.notify(
                    mentioned,
                    NotificationType.FORUM_MENTION,
                    currentUser.getName() + " mentioned you",
                    currentUser.getName() + " mentioned you in \"" + savedThread.getTitle() + "\" in "
                            + subject.getName(),
                    subject.getId(),
                    savedThread.getId());
        }

        return forumThreadMapper.toResponse(savedThread, 0);
    }

    @Override
    public ForumThreadResponse update(Long threadId, ForumThreadRequest request, User currentUser) {
        ForumThread thread = getActiveThread(threadId);
        subjectAccessService.checkAccess(thread.getSubject(), currentUser);
        checkEditPermission(thread.getAuthor(), currentUser);

        thread.setTitle(request.getTitle());
        thread.setBody(request.getBody());
        thread.setAttachmentStorageKey(request.getAttachmentStorageKey());
        thread.setAttachmentFileName(request.getAttachmentFileName());
        thread.setAttachmentContentType(request.getAttachmentContentType());
        thread.setAttachmentSizeBytes(request.getAttachmentSizeBytes());
        return toResponse(forumThreadRepository.save(thread));
    }

    @Override
    public UploadUrl createUploadUrl(MaterialUploadUrlRequest request) {
        return storageService.createUploadUrl("forum", request.getFileName(), request.getContentType(),
                request.getSizeBytes());
    }

    @Override
    public DownloadUrl createAttachmentDownloadUrl(Long threadId, User currentUser) {
        ForumThread thread = getActiveThread(threadId);
        subjectAccessService.checkAccess(thread.getSubject(), currentUser);
        if (thread.getAttachmentStorageKey() == null) {
            throw new ResourceNotFoundException("Forum thread attachment not found: " + threadId);
        }
        return storageService.createDownloadUrl(thread.getAttachmentStorageKey());
    }

    @Override
    public void delete(Long threadId, User currentUser) {
        ForumThread thread = getActiveThread(threadId);
        subjectAccessService.checkAccess(thread.getSubject(), currentUser);
        checkDeletePermission(thread.getAuthor(), currentUser);

        thread.setDeletedAt(Instant.now());
        forumThreadRepository.save(thread);
    }

    private ForumThreadResponse toResponse(ForumThread thread) {
        long postCount = forumPostRepository.countByThreadIdAndDeletedAtIsNull(thread.getId());
        return forumThreadMapper.toResponse(thread, Math.toIntExact(postCount));
    }

    private void checkEditPermission(User author, User currentUser) {
        if (!author.getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Not allowed to edit this forum thread");
        }
    }

    private void checkDeletePermission(User author, User currentUser) {
        boolean staff = currentUser.getType() == UserType.ADMIN || currentUser.getType() == UserType.PROFESSOR;
        if (!author.getId().equals(currentUser.getId()) && !staff) {
            throw new AccessDeniedException("Not allowed to modify this forum thread");
        }
    }

    private ForumThread getActiveThread(Long id) {
        return forumThreadRepository.findById(id).filter(thread -> thread.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Forum thread not found: " + id));
    }

}
