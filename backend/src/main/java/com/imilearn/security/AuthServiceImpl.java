package com.imilearn.security;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.security.dto.AuthResponse;
import com.imilearn.security.dto.CurrentUserResponse;
import com.imilearn.security.dto.LoginRequest;
import com.imilearn.security.dto.RegisterRequest;
import com.imilearn.user.User;
import com.imilearn.user.UserRepository;
import com.imilearn.user.UserType;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = userRepository
                .save(User.builder().email(request.getEmail()).password(passwordEncoder.encode(request.getPassword()))
                        .name(request.getName()).surname(request.getSurname()).type(UserType.STUDENT).build());

        return toResponse(user, jwtService.generateToken(user));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.getEmail()));

        return toResponse(user, jwtService.generateToken(user));
    }

    @Override
    public CurrentUserResponse currentUser(User user) {
        return CurrentUserResponse.builder().id(user.getId()).email(user.getEmail()).name(user.getName()).surname(user.getSurname())
                .type(user.getType()).espb(user.getEspb()).score(user.getScore()).year(user.getYear())
                .index(user.getIndex()).build();
    }

    private AuthResponse toResponse(User user, String token) {
        return AuthResponse.builder().id(user.getId()).token(token).email(user.getEmail()).name(user.getName())
                .surname(user.getSurname()).type(user.getType()).espb(user.getEspb()).score(user.getScore())
                .year(user.getYear()).index(user.getIndex()).build();
    }
}
