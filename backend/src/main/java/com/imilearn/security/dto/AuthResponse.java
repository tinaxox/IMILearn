package com.imilearn.security.dto;

import com.imilearn.user.UserType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AuthResponse {
    private Long id;
    private String token;
    private String email;
    private String name;
    private String surname;
    private UserType type;
    private Integer espb;
    private Double score;
    private Integer year;
    private String index;
}
