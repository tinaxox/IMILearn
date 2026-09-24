package com.imilearn.assignment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    Page<Assignment> findBySubjectIdAndDeletedAtIsNull(Long subjectId, Pageable pageable);
}
