package com.imilearn.subject.dto;

import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class SubjectResponse {

    private Long id;
    private String name;
    private Integer year;
    private String professorName;
    private long memberCount;
    private Instant createdAt;
    private Instant updatedAt;
}
