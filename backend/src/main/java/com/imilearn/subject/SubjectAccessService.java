package com.imilearn.subject;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.user.User;
import com.imilearn.user.UserType;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubjectAccessService {

    private final SubjectRepository subjectRepository;

    public Subject getAccessibleSubject(Long id, User currentUser) {
        boolean restricted = currentUser.getType() != UserType.ADMIN;
        return (restricted ? subjectRepository.findByIdAndUsersIdAndUsersDeletedAtIsNull(id, currentUser.getId())
                : subjectRepository.findById(id)).orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + id));
    }

    public void checkAccess(Subject subject, User currentUser) {
        if (currentUser.getType() != UserType.ADMIN
                && !subjectRepository.existsByIdAndUsersIdAndUsersDeletedAtIsNull(subject.getId(), currentUser.getId())) {
            throw new AccessDeniedException("Not a member of this subject");
        }
    }
}
