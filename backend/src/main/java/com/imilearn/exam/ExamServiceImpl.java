package com.imilearn.exam;

import com.imilearn.exam.dto.ExamRequest;
import com.imilearn.exam.dto.ExamResponse;
import com.imilearn.exam.dto.ExamMaxPointsRequest;
import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.notification.NotificationService;
import com.imilearn.notification.NotificationType;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.user.User;
import com.imilearn.user.UserType;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamServiceImpl implements ExamService {

    private final ExamRepository examRepository;
    private final SubjectAccessService subjectAccessService;
    private final ExamMapper examMapper;
    private final NotificationService notificationService;

    @Override
    public Page<ExamResponse> findBySubject(Long subjectId, Pageable pageable, User currentUser) {
        subjectAccessService.getAccessibleSubject(subjectId, currentUser);

        return examRepository.findBySubjectIdAndDeletedAtIsNull(subjectId, pageable).map(examMapper::toResponse);
    }

    @Override
    public List<ExamResponse> findAllAccessible(User currentUser) {
        List<Exam> exams = currentUser.getType() == UserType.ADMIN
                ? examRepository.findByDeletedAtIsNullOrderByDateAsc()
                : examRepository.findByDeletedAtIsNullAndSubjectUsersIdAndSubjectUsersDeletedAtIsNullOrderByDateAsc(
                        currentUser.getId());
        return exams.stream().map(examMapper::toResponse).toList();
    }

    @Override
    public ExamResponse findById(Long id, User currentUser) {
        Exam exam = getActiveExam(id);
        subjectAccessService.checkAccess(exam.getSubject(), currentUser);

        return examMapper.toResponse(exam);
    }

    @Override
    public ExamResponse create(ExamRequest request, User currentUser) {
        Subject subject = subjectAccessService.getAccessibleSubject(request.getSubjectId(), currentUser);

        Exam exam = examRepository
                .save(Exam.builder().name(request.getName()).date(request.getDate()).type(request.getType())
                        .maxPoints(request.getMaxPoints()).subject(subject).build());
        notificationService.notify(
                subject.getUsers().stream().filter(user -> user.getType() == UserType.STUDENT).toList(),
                NotificationType.EXAM_SCHEDULED, "New exam scheduled: " + exam.getName(),
                "A new exam was scheduled in " + subject.getName(), subject.getId(), exam.getId());
        return examMapper.toResponse(exam);
    }

    @Override
    public ExamResponse update(Long id, ExamRequest request, User currentUser) {
        Exam exam = getActiveExam(id);
        subjectAccessService.checkAccess(exam.getSubject(), currentUser);
        Instant oldDate = exam.getDate();
        List<User> students = exam.getSubject().getUsers().stream()
                .filter(user -> user.getType() == UserType.STUDENT).toList();
        Long notificationSubjectId = exam.getSubject().getId();

        exam.setName(request.getName());
        exam.setDate(request.getDate());
        exam.setType(request.getType());
        exam.setMaxPoints(request.getMaxPoints());
        if (!request.getSubjectId().equals(exam.getSubject().getId())) {
            exam.setSubject(subjectAccessService.getAccessibleSubject(request.getSubjectId(), currentUser));
        }

        Exam savedExam = examRepository.save(exam);
        if (!oldDate.equals(exam.getDate())) {
            notificationService.notify(students, NotificationType.EXAM_TIME_CHANGED,
                    "Exam time changed: " + exam.getName(),
                    "The exam time changed from " + oldDate + " to " + exam.getDate(), notificationSubjectId,
                    exam.getId());
        }
        return examMapper.toResponse(savedExam);
    }

    @Override
    public ExamResponse updateMaxPoints(Long id, ExamMaxPointsRequest request, User currentUser) {
        Exam exam = getActiveExam(id);
        subjectAccessService.checkAccess(exam.getSubject(), currentUser);
        exam.setMaxPoints(request.getMaxPoints());
        return examMapper.toResponse(examRepository.save(exam));
    }

    @Override
    public void delete(Long id, User currentUser) {
        Exam exam = getActiveExam(id);
        subjectAccessService.checkAccess(exam.getSubject(), currentUser);

        exam.setDeletedAt(Instant.now());
        examRepository.save(exam);
    }

    @Override
    public List<ExamResponse> findUpcomingForCurrentUser(User currentUser) {
        List<Exam> exams = currentUser.getType() == UserType.ADMIN
                ? examRepository.findTop10ByDeletedAtIsNullAndDateAfterOrderByDateAsc(Instant.now())
                : examRepository.findTop10ByDeletedAtIsNullAndDateAfterAndSubjectUsersIdAndSubjectUsersDeletedAtIsNullOrderByDateAsc(
                        Instant.now(), currentUser.getId());

        return exams.stream().map(examMapper::toResponse).toList();
    }

    private Exam getActiveExam(Long id) {
        return examRepository.findById(id).filter(exam -> exam.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + id));
    }

}
