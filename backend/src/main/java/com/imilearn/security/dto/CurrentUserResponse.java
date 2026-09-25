package com.imilearn.security.dto;

import com.imilearn.user.UserType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CurrentUserResponse {
    private Long id;
    private String email;
    private String name;
    private String surname;
    private UserType type;
    private Integer espb;
    private Double score;
    private Integer year;
    private String index;
}
