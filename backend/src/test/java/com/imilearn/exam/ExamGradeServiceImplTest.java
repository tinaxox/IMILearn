package com.imilearn.exam;

import static com.imilearn.TestFixtures.exam;
import static com.imilearn.TestFixtures.subject;
import static com.imilearn.TestFixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.imilearn.exam.dto.StudentExamGradeResponse;
import com.imilearn.notification.NotificationService;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.subject.SubjectRepository;
import com.imilearn.user.User;
import com.imilearn.user.UserRepository;
import com.imilearn.user.UserType;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ExamGradeServiceImplTest {

    @Test
    void studentCanGetPointsForEveryExamInSubject() {
        SubjectRepository subjects = mock(SubjectRepository.class);
        ExamRepository exams = mock(ExamRepository.class);
        ExamGradeRepository grades = mock(ExamGradeRepository.class);
        User student = user(11L, UserType.STUDENT);
        Subject subject = subject(3L, "Web", 2);
        when(subjects.findByIdAndUsersIdAndUsersDeletedAtIsNull(3L, 11L)).thenReturn(Optional.of(subject));
        Exam first = exam(20L, subject, "Midterm");
        Exam second = exam(21L, subject, "Final");
        when(exams.findBySubjectIdAndDeletedAtIsNullOrderByDateAsc(3L)).thenReturn(List.of(first, second));
        when(grades.findByStudentIdAndExamIdIn(11L, List.of(20L, 21L))).thenReturn(List.of());
        ExamGradeServiceImpl service = new ExamGradeServiceImpl(exams, grades, subjects, mock(SubjectAccessService.class),
                mock(UserRepository.class), new ExamGradeMapper(), mock(NotificationService.class));

        List<StudentExamGradeResponse> response = service.findMyGradesForSubject(3L, student);

        assertThat(response).extracting(StudentExamGradeResponse::getExamName).containsExactly("Midterm", "Final");
        assertThat(response).allSatisfy(result -> assertThat(result.getPoints()).isNull());
    }
}
