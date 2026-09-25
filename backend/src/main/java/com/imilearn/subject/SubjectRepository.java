package com.imilearn.subject;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    boolean existsByIdAndUsersIdAndUsersDeletedAtIsNull(Long id, Long userId);

    Optional<Subject> findByIdAndUsersIdAndUsersDeletedAtIsNull(Long id, Long userId);

    List<Subject> findByDeletedAtIsNull();

    List<Subject> findByDeletedAtIsNullAndUsersIdAndUsersDeletedAtIsNull(Long userId);
}
