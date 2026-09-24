package com.imilearn.assignment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignmentMaxPointsRequest {
    @NotNull
    @Positive
    private Double maxPoints;
}
