package com.imilearn.forum;

import com.imilearn.forum.dto.ForumThreadRequest;
import com.imilearn.forum.dto.ForumThreadResponse;
import com.imilearn.material.dto.MaterialUploadUrlRequest;
import com.imilearn.storage.dto.DownloadUrl;
import com.imilearn.storage.dto.UploadUrl;
import com.imilearn.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ForumThreadService {

    Page<ForumThreadResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser);

    ForumThreadResponse findById(Long threadId, User currentUser);

    ForumThreadResponse create(Long subjectId, ForumThreadRequest request, User currentUser);

    ForumThreadResponse update(Long threadId, ForumThreadRequest request, User currentUser);

    UploadUrl createUploadUrl(MaterialUploadUrlRequest request);

    DownloadUrl createAttachmentDownloadUrl(Long threadId, User currentUser);

    void delete(Long threadId, User currentUser);
}
