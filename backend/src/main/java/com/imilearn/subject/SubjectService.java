package com.imilearn.subject;

import com.imilearn.subject.dto.SubjectRequest;
import com.imilearn.subject.dto.SubjectResponse;
import com.imilearn.user.User;
import com.imilearn.user.dto.UserResponse;
import java.util.List;

public interface SubjectService {

    List<SubjectResponse> findAll(User currentUser);

    SubjectResponse findById(Long id, User currentUser);

    SubjectResponse create(SubjectRequest request, User currentUser);

    SubjectResponse update(Long id, SubjectRequest request, User currentUser);

    void delete(Long id, User currentUser);

    List<UserResponse> listMembers(Long id, User currentUser);

    List<UserResponse> addMember(Long id, Long userId, User currentUser);

    List<UserResponse> removeMember(Long id, Long userId, User currentUser);
}
