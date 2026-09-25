package com.imilearn.forum;

import com.imilearn.forum.dto.ForumPostRequest;
import com.imilearn.forum.dto.ForumPostResponse;
import org.springframework.stereotype.Component;

@Component
public class ForumPostMapper {

    public ForumPostResponse toResponse(ForumPost post) {
        return ForumPostResponse.builder().id(post.getId()).threadId(post.getThread().getId())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getName() + " " + post.getAuthor().getSurname()).body(post.getBody())
                .createdAt(post.getCreatedAt()).build();
    }

    public ForumPost toEntity(ForumPostRequest request) {
        return ForumPost.builder().body(request.getBody()).build();
    }
}
