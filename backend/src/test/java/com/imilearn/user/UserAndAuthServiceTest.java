package com.imilearn.user;

import static com.imilearn.TestFixtures.user;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.imilearn.security.AuthServiceImpl;
import com.imilearn.security.JwtService;
import com.imilearn.security.dto.AuthResponse;
import com.imilearn.security.dto.LoginRequest;
import com.imilearn.user.dto.UserResponse;
import com.imilearn.user.dto.UserUpdateRequest;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

class UserAndAuthServiceTest {

    @Test
    void adminCanChangeStudentProfileAndReadTheChangedValues() {
        UserRepository users = mock(UserRepository.class);
        User student = user(8L, UserType.STUDENT);
        when(users.findById(8L)).thenReturn(Optional.of(student));
        when(users.save(student)).thenReturn(student);
        UserServiceImpl service = new UserServiceImpl(users, new UserMapper(), mock(PasswordEncoder.class));
        UserUpdateRequest request = new UserUpdateRequest();
        request.setEmail("student@example.test"); request.setName("Ana"); request.setSurname("Jovic");
        request.setType(UserType.STUDENT); request.setIndex("RA 12/2024"); request.setEspb(48); request.setYear(2);

        service.update(8L, request);
        UserResponse response = service.findById(8L);

        assertThat(response.getIndex()).isEqualTo("RA 12/2024");
        assertThat(response.getEspb()).isEqualTo(48);
        assertThat(response.getYear()).isEqualTo(2);
    }

    @Test
    void anyExistingUserCanLogIn() {
        UserRepository users = mock(UserRepository.class);
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
        JwtService jwt = mock(JwtService.class);
        User professor = user(9L, UserType.PROFESSOR);
        when(users.findByEmail("professor@example.test")).thenReturn(Optional.of(professor));
        when(jwt.generateToken(professor)).thenReturn("signed-token");
        AuthServiceImpl service = new AuthServiceImpl(users, mock(PasswordEncoder.class), authenticationManager, jwt);
        LoginRequest request = new LoginRequest();
        request.setEmail("professor@example.test"); request.setPassword("correct-password");

        AuthResponse response = service.login(request);

        assertThat(response.getToken()).isEqualTo("signed-token");
        assertThat(response.getType()).isEqualTo(UserType.PROFESSOR);
        verify(authenticationManager).authenticate(any());
    }
}
