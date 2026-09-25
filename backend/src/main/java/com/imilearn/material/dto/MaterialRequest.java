package com.imilearn.material.dto;

import com.imilearn.material.MaterialType;
import com.imilearn.material.MaterialCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialRequest {

    @NotNull
    private MaterialType type;

    @NotNull
    private MaterialCategory category;

    @NotBlank
    private String path;

    @NotBlank
    private String name;

    @NotNull
    private Long subjectId;
}
