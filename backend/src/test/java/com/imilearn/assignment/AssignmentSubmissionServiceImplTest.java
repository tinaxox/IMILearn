package com.imilearn.assignment;

import static com.imilearn.TestFixtures.subject;
import static com.imilearn.TestFixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.imilearn.assignment.dto.AssignmentSubmissionResponse;
import com.imilearn.notification.NotificationService;
import com.imilearn.storage.StorageService;
import com.imilearn.subject.Subject;
import com.imilearn.subject.SubjectAccessService;
import com.imilearn.subject.SubjectRepository;
import com.imilearn.user.UserType;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class AssignmentSubmissionServiceImplTest {

    @Test
    void professorCanSeeStudentsWhoSubmittedAssignment() {
        AssignmentRepository assignments = mock(AssignmentRepository.class);
        AssignmentSubmissionRepository submissions = mock(AssignmentSubmissionRepository.class);
        Subject subject = subject(3L, "Web", 2);
        Assignment assignment = Assignment.builder().title("Homework").subject(subject).dueDate(Instant.now().plusSeconds(3600)).build();
        assignment.setId(4L);
        AssignmentSubmission submission = AssignmentSubmission.builder().assignment(assignment).student(user(11L, UserType.STUDENT)).build();
        when(assignments.findById(4L)).thenReturn(Optional.of(assignment));
        when(submissions.findByAssignmentId(4L)).thenReturn(List.of(submission));
        AssignmentSubmissionMapper mapper = mock(AssignmentSubmissionMapper.class);
        when(mapper.toResponse(submission)).thenReturn(AssignmentSubmissionResponse.builder().studentId(11L).studentEmail("student@example.test").build());
        SubjectAccessService access = mock(SubjectAccessService.class);
        AssignmentSubmissionServiceImpl service = new AssignmentSubmissionServiceImpl(assignments, submissions,
                mock(SubmissionFileRepository.class), mapper, mock(StorageService.class), mock(SubjectRepository.class), access,
                mock(NotificationService.class));

        List<AssignmentSubmissionResponse> response = service.findAllForAssignment(4L, user(2L, UserType.PROFESSOR));

        assertThat(response).singleElement().extracting(AssignmentSubmissionResponse::getStudentId).isEqualTo(11L);
        verify(access).checkAccess(eq(subject), any());
    }
}
