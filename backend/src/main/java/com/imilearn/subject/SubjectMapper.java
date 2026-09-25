package com.imilearn.subject;

import com.imilearn.subject.dto.SubjectResponse;
import com.imilearn.user.UserType;
import org.springframework.stereotype.Component;

@Component
public class SubjectMapper {

    public SubjectResponse toResponse(Subject subject) {
        String professorName = subject.getUsers().stream()
                .filter(user -> user.getDeletedAt() == null && user.getType() == UserType.PROFESSOR)
                .map(user -> (user.getName() + " " + user.getSurname()).trim())
                .sorted()
                .findFirst()
                .orElse(null);
        long memberCount = subject.getUsers().stream().filter(user -> user.getDeletedAt() == null).count();

        return SubjectResponse.builder().id(subject.getId()).name(subject.getName()).year(subject.getYear())
                .professorName(professorName).memberCount(memberCount)
                .createdAt(subject.getCreatedAt()).updatedAt(subject.getUpdatedAt()).build();
    }
}
