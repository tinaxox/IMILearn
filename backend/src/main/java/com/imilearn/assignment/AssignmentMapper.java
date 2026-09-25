package com.imilearn.assignment;

import com.imilearn.assignment.dto.AssignmentResponse;
import org.springframework.stereotype.Component;

@Component
public class AssignmentMapper {

    public AssignmentResponse toResponse(Assignment assignment) {
        return AssignmentResponse.builder().id(assignment.getId()).title(assignment.getTitle())
                .description(assignment.getDescription()).dueDate(assignment.getDueDate())
                .maxPoints(assignment.getMaxPoints()).subjectId(assignment.getSubject().getId())
                .createdAt(assignment.getCreatedAt()).updatedAt(assignment.getUpdatedAt()).build();
    }
}
