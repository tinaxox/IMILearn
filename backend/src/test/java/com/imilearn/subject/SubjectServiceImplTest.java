package com.imilearn.subject;

import static com.imilearn.TestFixtures.subject;
import static com.imilearn.TestFixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.imilearn.notification.NotificationService;
import com.imilearn.subject.dto.SubjectRequest;
import com.imilearn.user.User;
import com.imilearn.user.UserMapper;
import com.imilearn.user.UserRepository;
import com.imilearn.user.UserType;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class SubjectServiceImplTest {

    @Test
    void adminCanEditSubjectNameAndYear() {
        SubjectRepository subjects = mock(SubjectRepository.class);
        SubjectAccessService access = mock(SubjectAccessService.class);
        Subject subject = subject(10L, "Old name", 1);
        when(subjects.findById(10L)).thenReturn(Optional.of(subject));
        when(subjects.save(subject)).thenReturn(subject);
        SubjectServiceImpl service = new SubjectServiceImpl(subjects, access, new SubjectMapper(), mock(UserRepository.class),
                new UserMapper(), mock(NotificationService.class));
        SubjectRequest request = new SubjectRequest();
        request.setName("Distributed systems");
        request.setYear(3);
        User admin = user(1L, UserType.ADMIN);

        var response = service.update(10L, request, admin);

        assertThat(response.getName()).isEqualTo("Distributed systems");
        assertThat(response.getYear()).isEqualTo(3);
        verify(access).checkAccess(subject, admin);
        verify(subjects).save(subject);
    }
}
