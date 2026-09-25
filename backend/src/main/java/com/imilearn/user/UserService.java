package com.imilearn.user;

import com.imilearn.user.dto.UserRequest;
import com.imilearn.user.dto.UserResponse;
import com.imilearn.user.dto.UserUpdateRequest;
import java.util.List;

public interface UserService {

    List<UserResponse> findAll();

    UserResponse findById(Long id);

    UserResponse create(UserRequest request);

    UserResponse update(Long id, UserUpdateRequest request);

    void delete(Long id);
}
