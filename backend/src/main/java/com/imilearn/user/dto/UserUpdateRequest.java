package com.imilearn.user.dto;

import com.imilearn.user.UserType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateRequest {

    @NotBlank
    @Email
    private String email;

    private String password;

    @NotBlank
    private String name;

    @NotBlank
    private String surname;

    @NotNull
    private UserType type;

    private Integer espb;
    private Double score;
    private Integer year;
    private String index;
}
