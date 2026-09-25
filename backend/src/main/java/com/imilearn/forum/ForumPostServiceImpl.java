package com.imilearn.forum;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.forum.dto.ForumPostRequest;
import com.imilearn.forum.dto.ForumPostResponse;
import com.imilearn.notification.NotificationService;
import com.imilearn.notification.NotificationType;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ForumPostServiceImpl implements ForumPostService {

    private final ForumPostRepository forumPostRepository;
    private final ForumThreadRepository forumThreadRepository;
    private final SubjectAccessService subjectAccessService;
    private final ForumPostMapper forumPostMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Override
    public Page<ForumPostResponse> findByThread(Long threadId, Pageable pageable, User currentUser) {
        ForumThread thread = getActiveThread(threadId);
        subjectAccessService.checkAccess(thread.getSubject(), currentUser);

        return forumPostRepository.findByThreadIdAndDeletedAtIsNull(threadId, pageable)
                .map(forumPostMapper::toResponse);
    }

    @Override
    public ForumPostResponse create(Long threadId, ForumPostRequest request, User currentUser) {
        ForumThread thread = getActiveThread(threadId);
        subjectAccessService.checkAccess(thread.getSubject(), currentUser);

        ForumPost post = forumPostMapper.toEntity(request);
        post.setThread(thread);
        post.setAuthor(currentUser);
        ForumPostResponse response = forumPostMapper.toResponse(forumPostRepository.save(post));
        messagingTemplate.convertAndSend("/topic/forum/threads/" + threadId, response);
        List<User> mentioned = MentionParser.findMentioned(
                request.getBody(), thread.getSubject().getUsers(), currentUser);
        Set<Long> mentionedIds = mentioned.stream().map(User::getId).collect(Collectors.toSet());
        List<User> others = thread.getSubject().getUsers().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .filter(user -> !mentionedIds.contains(user.getId()))
                .toList();

        if (!others.isEmpty()) {
            notificationService.notify(
                    others,
                    NotificationType.FORUM_POST_CREATED,
                    "New reply in " + thread.getTitle(),
                    currentUser.getName() + " replied to a thread in " + thread.getSubject().getName(),
                    thread.getSubject().getId(),
                    threadId);
        }
        if (!mentioned.isEmpty()) {
            notificationService.notify(
                    mentioned,
                    NotificationType.FORUM_MENTION,
                    currentUser.getName() + " mentioned you",
                    currentUser.getName() + " mentioned you in a reply in " + thread.getSubject().getName(),
                    thread.getSubject().getId(),
                    threadId);
        }

        return response;
    }

    @Override
    public ForumPostResponse update(Long postId, ForumPostRequest request, User currentUser) {
        ForumPost post = getActivePost(postId);
        subjectAccessService.checkAccess(post.getThread().getSubject(), currentUser);
        checkEditPermission(post.getAuthor(), currentUser);

        post.setBody(request.getBody());
        return forumPostMapper.toResponse(forumPostRepository.save(post));
    }

    @Override
    public void delete(Long postId, User currentUser) {
        ForumPost post = getActivePost(postId);
        subjectAccessService.checkAccess(post.getThread().getSubject(), currentUser);
        checkDeletePermission(post.getAuthor(), currentUser);

        post.setDeletedAt(Instant.now());
        forumPostRepository.save(post);
    }

    private void checkEditPermission(User author, User currentUser) {
        if (!author.getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Not allowed to edit this forum post");
        }
    }

    private void checkDeletePermission(User author, User currentUser) {
        boolean staff = currentUser.getType() == UserType.ADMIN || currentUser.getType() == UserType.PROFESSOR;
        if (!author.getId().equals(currentUser.getId()) && !staff) {
            throw new AccessDeniedException("Not allowed to modify this forum post");
        }
    }

    private ForumThread getActiveThread(Long id) {
        return forumThreadRepository.findById(id).filter(thread -> thread.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Forum thread not found: " + id));
    }

    private ForumPost getActivePost(Long id) {
        return forumPostRepository.findById(id).filter(post -> post.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Forum post not found: " + id));
    }
}
