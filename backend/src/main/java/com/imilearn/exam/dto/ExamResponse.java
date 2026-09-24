package com.imilearn.exam.dto;

import com.imilearn.exam.ExamType;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ExamResponse {

    private Long id;
    private String name;
    private Instant date;
    private ExamType type;
    private Double maxPoints;
    private Long subjectId;
    private String subjectName;
    private Instant createdAt;
    private Instant updatedAt;
}
