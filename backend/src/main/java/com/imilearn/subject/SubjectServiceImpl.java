package com.imilearn.subject;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.notification.NotificationService;
import com.imilearn.notification.NotificationType;
import com.imilearn.subject.dto.SubjectRequest;
import com.imilearn.subject.dto.SubjectResponse;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import com.imilearn.user.User;
import com.imilearn.user.UserMapper;
import com.imilearn.user.UserRepository;
import com.imilearn.user.UserType;
import com.imilearn.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectAccessService subjectAccessService;
    private final SubjectMapper subjectMapper;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final NotificationService notificationService;

    @Override
    public List<SubjectResponse> findAll(User currentUser) {
        List<Subject> subjects = currentUser.getType() == UserType.ADMIN ? subjectRepository.findByDeletedAtIsNull()
                : subjectRepository.findByDeletedAtIsNullAndUsersIdAndUsersDeletedAtIsNull(currentUser.getId());

        return subjects.stream().map(subjectMapper::toResponse).toList();
    }

    @Override
    public SubjectResponse findById(Long id, User currentUser) {
        Subject subject = getActiveSubject(id);
        subjectAccessService.checkAccess(subject, currentUser);

        return subjectMapper.toResponse(subject);
    }

    @Override
    public SubjectResponse create(SubjectRequest request, User currentUser) {
        Subject subject = subjectRepository
                .save(Subject.builder().name(request.getName()).year(request.getYear()).build());
        if (currentUser.getType() == UserType.PROFESSOR) {
            User managedUser = userRepository.findById(currentUser.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUser.getId()));
            managedUser.getSubjects().add(subject);
            userRepository.save(managedUser);
        }

        return subjectMapper.toResponse(subject);
    }

    @Override
    public SubjectResponse update(Long id, SubjectRequest request, User currentUser) {
        Subject subject = getActiveSubject(id);
        subjectAccessService.checkAccess(subject, currentUser);

        subject.setName(request.getName());
        subject.setYear(request.getYear());

        return subjectMapper.toResponse(subjectRepository.save(subject));
    }

    @Override
    public void delete(Long id, User currentUser) {
        Subject subject = getActiveSubject(id);
        subjectAccessService.checkAccess(subject, currentUser);

        subject.setDeletedAt(Instant.now());
        subjectRepository.save(subject);
    }

    @Override
    public List<UserResponse> listMembers(Long id, User currentUser) {
        Subject subject = getActiveSubject(id);
        subjectAccessService.checkAccess(subject, currentUser);

        return subject.getUsers().stream().filter(user -> user.getDeletedAt() == null)
                .sorted(Comparator.comparing(User::getEmail)).map(userMapper::toResponse).toList();
    }

    @Override
    public List<UserResponse> addMember(Long id, Long userId, User currentUser) {
        Subject subject = getActiveSubject(id);
        subjectAccessService.checkAccess(subject, currentUser);
        User member = getActiveUser(userId);

        member.getSubjects().add(subject);
        userRepository.save(member);
        subject.getUsers().add(member);
        notificationService.notify(List.of(member), NotificationType.SUBJECT_MEMBER_ADDED,
                "You were added to " + subject.getName(), "You are now a member of " + subject.getName(),
                subject.getId(), null);

        return listMembers(id, currentUser);
    }

    @Override
    public List<UserResponse> removeMember(Long id, Long userId, User currentUser) {
        Subject subject = getActiveSubject(id);
        subjectAccessService.checkAccess(subject, currentUser);
        User member = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        member.getSubjects().removeIf(s -> s.getId().equals(id));
        userRepository.save(member);
        subject.getUsers().removeIf(u -> u.getId().equals(userId));

        return listMembers(id, currentUser);
    }

    private User getActiveUser(Long id) {
        return userRepository.findById(id).filter(user -> user.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private Subject getActiveSubject(Long id) {
        return subjectRepository.findById(id).filter(subject -> subject.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + id));
    }
}
