package com.imilearn.material.dto;

import com.imilearn.material.MaterialType;
import com.imilearn.material.MaterialCategory;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class MaterialResponse {

    private Long id;
    private MaterialType type;
    private MaterialCategory category;
    private String path;
    private String name;
    private Long subjectId;
    private Instant createdAt;
    private Instant updatedAt;
}
