package com.imilearn.forum;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {

    Page<ForumPost> findByThreadId(Long threadId, Pageable pageable);

    Page<ForumPost> findByThreadIdAndDeletedAtIsNull(Long threadId, Pageable pageable);

    long countByThreadIdAndDeletedAtIsNull(Long threadId);
}
