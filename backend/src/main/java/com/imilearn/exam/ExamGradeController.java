package com.imilearn.exam;

import com.imilearn.exam.dto.ExamGradeRequest;
import com.imilearn.exam.dto.ExamGradeResponse;
import com.imilearn.exam.dto.StudentExamGradeResponse;
import com.imilearn.user.User;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/exams")
@RequiredArgsConstructor
public class ExamGradeController {

    private final ExamGradeService examGradeService;

    @PutMapping("/{examId}/grades/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<ExamGradeResponse> gradeStudent(@PathVariable Long examId, @PathVariable Long studentId, @Valid @RequestBody ExamGradeRequest request, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(examGradeService.gradeStudent(examId, studentId, request, currentUser));
    }

    @GetMapping("/{examId}/grades")
    @PreAuthorize("hasAnyRole('ADMIN','PROFESSOR')")
    public ResponseEntity<List<ExamGradeResponse>> findGradesForExam(@PathVariable Long examId, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(examGradeService.findGradesForExam(examId, currentUser));
    }

    @GetMapping("/my-grades")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentExamGradeResponse>> findMyGradesForSubject(@RequestParam Long subject, @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(examGradeService.findMyGradesForSubject(subject, currentUser));
    }
}
