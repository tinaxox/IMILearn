package com.imilearn.material;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    Page<Material> findBySubjectIdAndDeletedAtIsNull(Long subjectId, Pageable pageable);
}
