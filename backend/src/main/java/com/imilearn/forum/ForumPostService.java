package com.imilearn.forum;

import com.imilearn.forum.dto.ForumPostRequest;
import com.imilearn.forum.dto.ForumPostResponse;
import com.imilearn.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ForumPostService {

    Page<ForumPostResponse> findByThread(Long threadId, Pageable pageable, User currentUser);

    ForumPostResponse create(Long threadId, ForumPostRequest request, User currentUser);

    ForumPostResponse update(Long postId, ForumPostRequest request, User currentUser);

    void delete(Long postId, User currentUser);
}
