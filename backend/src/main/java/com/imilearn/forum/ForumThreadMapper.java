package com.imilearn.forum;

import com.imilearn.forum.dto.ForumThreadRequest;
import com.imilearn.forum.dto.ForumThreadResponse;
import org.springframework.stereotype.Component;

@Component
public class ForumThreadMapper {

    public ForumThreadResponse toResponse(ForumThread thread, int postCount) {
        return ForumThreadResponse.builder().id(thread.getId()).title(thread.getTitle()).body(thread.getBody())
                .attachmentStorageKey(thread.getAttachmentStorageKey())
                .attachmentFileName(thread.getAttachmentFileName())
                .attachmentContentType(thread.getAttachmentContentType())
                .attachmentSizeBytes(thread.getAttachmentSizeBytes())
                .subjectId(thread.getSubject().getId()).authorId(thread.getAuthor().getId())
                .authorName(thread.getAuthor().getName() + " " + thread.getAuthor().getSurname())
                .createdAt(thread.getCreatedAt()).postCount(postCount).build();
    }

    public ForumThread toEntity(ForumThreadRequest request) {
        return ForumThread.builder().title(request.getTitle()).body(request.getBody())
                .attachmentStorageKey(request.getAttachmentStorageKey())
                .attachmentFileName(request.getAttachmentFileName())
                .attachmentContentType(request.getAttachmentContentType())
                .attachmentSizeBytes(request.getAttachmentSizeBytes()).build();
    }
}
