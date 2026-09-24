package com.imilearn.forum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForumPostRequest {

    @NotBlank
    private String body;
}
