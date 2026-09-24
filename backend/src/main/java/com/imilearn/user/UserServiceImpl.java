package com.imilearn.user;

import com.imilearn.exception.ResourceNotFoundException;
import com.imilearn.user.dto.UserRequest;
import com.imilearn.user.dto.UserResponse;
import com.imilearn.user.dto.UserUpdateRequest;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<UserResponse> findAll() {
        return userRepository.findAllByDeletedAtIsNull().stream().map(userMapper::toResponse).toList();
    }

    @Override
    public UserResponse findById(Long id) {
        return userMapper.toResponse(getActiveUser(id));
    }

    @Override
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = User.builder().email(request.getEmail()).password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName()).surname(request.getSurname()).type(request.getType())
                .espb(request.getEspb()).score(request.getScore()).year(request.getYear()).index(request.getIndex()).build();

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = getActiveUser(id);

        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setSurname(request.getSurname());
        user.setType(request.getType());
        user.setEspb(request.getType() == UserType.STUDENT ? request.getEspb() : null);
        user.setScore(request.getType() == UserType.STUDENT ? request.getScore() : null);
        user.setYear(request.getType() == UserType.STUDENT ? request.getYear() : null);
        user.setIndex(request.getType() == UserType.STUDENT ? request.getIndex() : null);
        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    public void delete(Long id) {
        User user = getActiveUser(id);

        user.setDeletedAt(Instant.now());
        user.getSubjects().clear();
        userRepository.save(user);
    }

    private User getActiveUser(Long id) {
        return userRepository.findById(id).filter(user -> user.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }
}
