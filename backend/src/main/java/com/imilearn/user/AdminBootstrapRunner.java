package com.imilearn.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrapRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminBootstrapProperties adminBootstrapProperties;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByType(UserType.ADMIN)) {
            return;
        }
        userRepository.save(User.builder().email(adminBootstrapProperties.getEmail())
                .password(passwordEncoder.encode(adminBootstrapProperties.getPassword()))
                .name(adminBootstrapProperties.getName()).surname(adminBootstrapProperties.getSurname())
                .type(UserType.ADMIN).build());
        log.warn("No admin user existed, created default admin '{}'. Change its password immediately.",
                adminBootstrapProperties.getEmail());
    }
}
