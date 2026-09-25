package com.imilearn.exam;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.exam.dto.ExamGradeRequest;
import com.imilearn.exam.dto.ExamGradeResponse;
import com.imilearn.exam.dto.StudentExamGradeResponse;
import com.imilearn.notification.NotificationService;
import com.imilearn.notification.NotificationType;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.subject.SubjectRepository;
import com.imilearn.user.User;
import com.imilearn.user.UserRepository;
import com.imilearn.user.UserType;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamGradeServiceImpl implements ExamGradeService {

    private final ExamRepository examRepository;
    private final ExamGradeRepository examGradeRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectAccessService subjectAccessService;
    private final UserRepository userRepository;
    private final ExamGradeMapper examGradeMapper;
    private final NotificationService notificationService;

    @Override
    public ExamGradeResponse gradeStudent(Long examId, Long studentId, ExamGradeRequest request, User currentUser) {
        Exam exam = getActiveExam(examId);
        subjectAccessService.checkAccess(exam.getSubject(), currentUser);
        if (Instant.now().isBefore(exam.getDate())) {
            throw new IllegalArgumentException("Results cannot be entered before the exam date");
        }
        validateResult(exam, request);
        User student = userRepository.findById(studentId).filter(user -> user.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + studentId));
        if (student.getType() != UserType.STUDENT || !subjectRepository
                .existsByIdAndUsersIdAndUsersDeletedAtIsNull(exam.getSubject().getId(), student.getId())) {
            throw new IllegalArgumentException("User is not a student enrolled in this subject");
        }

        ExamGrade grade = examGradeRepository.findByExamIdAndStudentId(examId, studentId)
                .orElseGet(() -> ExamGrade.builder().exam(exam).student(student).build());
        grade.setPoints(request.getPoints());
        grade.setGrade(exam.getType() == ExamType.FINAL ? request.getGrade() : null);
        examGradeRepository.save(grade);
        String message = "You received " + grade.getPoints() + " points"
                + (grade.getGrade() != null ? " and grade " + grade.getGrade() : "");
        notificationService.notify(List.of(student), NotificationType.EXAM_GRADED,
                "Your exam was graded: " + exam.getName(), message, exam.getSubject().getId(), exam.getId());
        return examGradeMapper.toResponse(examId, student, grade);
    }

    @Override
    public List<ExamGradeResponse> findGradesForExam(Long examId, User currentUser) {
        Exam exam = getActiveExam(examId);
        subjectAccessService.checkAccess(exam.getSubject(), currentUser);
        Map<Long, ExamGrade> resultsByStudent = examGradeRepository.findByExamId(examId).stream()
                .collect(Collectors.toMap(grade -> grade.getStudent().getId(), grade -> grade));

        return exam.getSubject().getUsers().stream().filter(user -> user.getType() == UserType.STUDENT)
                .sorted(Comparator.comparing(User::getEmail))
                .map(student -> examGradeMapper.toResponse(examId, student, resultsByStudent.get(student.getId())))
                .toList();
    }

    @Override
    public List<StudentExamGradeResponse> findMyGradesForSubject(Long subjectId, User currentUser) {
        subjectRepository.findByIdAndUsersIdAndUsersDeletedAtIsNull(subjectId, currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + subjectId));
        List<Exam> exams = examRepository.findBySubjectIdAndDeletedAtIsNullOrderByDateAsc(subjectId);
        List<Long> examIds = exams.stream().map(Exam::getId).toList();
        Map<Long, ExamGrade> resultsByExam = examIds.isEmpty() ? Map.of()
                : examGradeRepository.findByStudentIdAndExamIdIn(currentUser.getId(), examIds).stream()
                        .collect(Collectors.toMap(grade -> grade.getExam().getId(), grade -> grade));

        return exams.stream().map(exam -> examGradeMapper.toStudentResponse(exam, resultsByExam.get(exam.getId())))
                .toList();
    }

    private void validateResult(Exam exam, ExamGradeRequest request) {
        if (exam.getType() == ExamType.FINAL) {
            if (request.getGrade() == null || request.getGrade() < 5 || request.getGrade() > 10) {
                throw new IllegalArgumentException("Final exam grade must be a whole number from 5 to 10");
            }
        }

        if (request.getPoints() == null) {
            throw new IllegalArgumentException("Points are required");
        }
        if (exam.getMaxPoints() == null) {
            throw new IllegalArgumentException("Maximum points must be set before grading this exam");
        }
        if (request.getPoints() > exam.getMaxPoints()) {
            throw new IllegalArgumentException("Points cannot exceed exam maximum of " + exam.getMaxPoints());
        }
        if (exam.getType() != ExamType.FINAL && request.getGrade() != null) {
            throw new IllegalArgumentException("Only final exams can have a grade");
        }
    }

    private Exam getActiveExam(Long id) {
        return examRepository.findById(id).filter(exam -> exam.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + id));
    }
}
