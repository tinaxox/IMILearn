package com.imilearn.user;

import com.imilearn.user.dto.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return UserResponse.builder().id(user.getId()).email(user.getEmail()).name(user.getName())
                .surname(user.getSurname()).type(user.getType()).espb(user.getEspb()).score(user.getScore())
                .year(user.getYear()).index(user.getIndex()).createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt()).build();
    }
}
