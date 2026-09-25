package com.imilearn.exam;

import static com.imilearn.TestFixtures.exam;
import static com.imilearn.TestFixtures.subject;
import static com.imilearn.TestFixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.imilearn.exam.dto.ExamMaxPointsRequest;
import com.imilearn.exam.dto.ExamRequest;
import com.imilearn.notification.NotificationService;
import com.imilearn.notification.NotificationType;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.user.User;
import com.imilearn.user.UserType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

class ExamServiceImplTest {

    @Test
    void professorCanSetExamMaximumPoints() {
        ExamRepository exams = mock(ExamRepository.class);
        Subject subject = subject(7L, "Databases", 2);
        Exam exam = exam(5L, subject, "Midterm");
        when(exams.findById(5L)).thenReturn(Optional.of(exam)); when(exams.save(exam)).thenReturn(exam);
        SubjectAccessService access = mock(SubjectAccessService.class);
        ExamServiceImpl service = new ExamServiceImpl(exams, access, new ExamMapper(), mock(NotificationService.class));
        ExamMaxPointsRequest request = new ExamMaxPointsRequest(); request.setMaxPoints(40.0);

        var response = service.updateMaxPoints(5L, request, user(2L, UserType.PROFESSOR));

        assertThat(response.getMaxPoints()).isEqualTo(40.0);
        verify(access).checkAccess(eq(subject), any(User.class)); verify(exams).save(exam);
    }

    @Test
    void professorCanScheduleExamAndEnrolledStudentCanSeeIt() {
        ExamRepository exams = mock(ExamRepository.class);
        SubjectAccessService access = mock(SubjectAccessService.class);
        NotificationService notifications = mock(NotificationService.class);
        User student = user(11L, UserType.STUDENT);
        Subject subject = subject(3L, "Web", 2); subject.getUsers().add(student);
        when(access.getAccessibleSubject(eq(3L), any(User.class))).thenReturn(subject);
        when(exams.save(any(Exam.class))).thenAnswer(invocation -> { Exam saved = invocation.getArgument(0); saved.setId(31L); return saved; });
        ExamServiceImpl service = new ExamServiceImpl(exams, access, new ExamMapper(), notifications);
        ExamRequest request = new ExamRequest();
        request.setName("Web midterm"); request.setDate(Instant.now().plusSeconds(86_400)); request.setType(ExamType.MIDTERM);
        request.setMaxPoints(30.0); request.setSubjectId(3L);

        var created = service.create(request, user(2L, UserType.PROFESSOR));
        when(exams.findBySubjectIdAndDeletedAtIsNull(3L, Pageable.unpaged())).thenReturn(new PageImpl<>(List.of(exam(created.getId(), subject, created.getName()))));
        var visibleToStudent = service.findBySubject(3L, Pageable.unpaged(), student);

        assertThat(visibleToStudent.getContent()).extracting("name").containsExactly("Web midterm");
        verify(notifications).notify(eq(List.of(student)), eq(NotificationType.EXAM_SCHEDULED), eq("New exam scheduled: Web midterm"), any(), eq(3L), eq(31L));
    }
}
