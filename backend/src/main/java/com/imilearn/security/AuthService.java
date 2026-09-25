package com.imilearn.security;

import com.imilearn.security.dto.AuthResponse;
import com.imilearn.security.dto.CurrentUserResponse;
import com.imilearn.security.dto.LoginRequest;
import com.imilearn.security.dto.RegisterRequest;
import com.imilearn.user.User;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    CurrentUserResponse currentUser(User user);
}
