package com.imilearn;

import com.imilearn.exam.Exam;
import com.imilearn.exam.ExamType;
import com.imilearn.material.Material;
import com.imilearn.material.MaterialType;
import com.imilearn.subject.Subject;
import com.imilearn.user.User;
import com.imilearn.user.UserType;
import java.time.Instant;

public final class TestFixtures {

    private TestFixtures() {
    }

    public static User user(Long id, UserType type) {
        User user = User.builder().email(type.name().toLowerCase() + "@example.test").password("encoded")
                .name("Test").surname("User").type(type).build();
        user.setId(id);
        return user;
    }

    public static Subject subject(Long id, String name, int year) {
        Subject subject = Subject.builder().name(name).year(year).build();
        subject.setId(id);
        return subject;
    }

    public static Exam exam(Long id, Subject subject, String name) {
        Exam exam = Exam.builder().name(name).date(Instant.now().minusSeconds(3600)).type(ExamType.MIDTERM)
                .maxPoints(30.0).subject(subject).build();
        exam.setId(id);
        return exam;
    }

    public static Material material(Long id, Subject subject, String name) {
        Material material = Material.builder().name(name).type(MaterialType.DOCUMENT).path("materials/" + id + ".pdf")
                .subject(subject).build();
        material.setId(id);
        return material;
    }
}
