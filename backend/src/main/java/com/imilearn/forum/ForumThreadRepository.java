package com.imilearn.forum;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForumThreadRepository extends JpaRepository<ForumThread, Long> {

    Page<ForumThread> findBySubjectId(Long subjectId, Pageable pageable);

    Page<ForumThread> findBySubjectIdAndDeletedAtIsNull(Long subjectId, Pageable pageable);
}
