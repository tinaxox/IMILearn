package com.imilearn.user.dto;

import com.imilearn.user.UserType;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private String surname;
    private UserType type;
    private Integer espb;
    private Double score;
    private Integer year;
    private String index;
    private Instant createdAt;
    private Instant updatedAt;
}
