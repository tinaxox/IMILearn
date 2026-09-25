import { Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import LoginPage from "@/features/auth/LoginPage"
import DashboardPage from "@/features/dashboard/DashboardPage"
import UsersPage from "@/features/users/UsersPage"
import SubjectsPage from "@/features/subjects/SubjectsPage"
import SubjectDetailPage from "@/features/subjects/SubjectDetailPage"
import AssignmentsPage from "@/features/assignments/AssignmentsPage"
import AssignmentDetailPage from "@/features/assignments/AssignmentDetailPage"
import ExamsPage from "@/features/exams/ExamsPage"
import QuizzesPage from "@/features/quizzes/QuizzesPage"
import QuizTakePage from "@/features/quizzes/QuizTakePage"
import QuizScoresPage from "@/features/quizzes/QuizScoresPage"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/subjects/:subjectId" element={<SubjectDetailPage />} />
          <Route path="/subjects/:subjectId/assignments" element={<AssignmentsPage />} />
          <Route path="/assignments/:assignmentId" element={<AssignmentDetailPage />} />
          <Route path="/subjects/:subjectId/exams" element={<ExamsPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/subjects/:subjectId/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:quizId/take" element={<QuizTakePage />} />
          <Route path="/quizzes/scores" element={<QuizScoresPage />} />

          <Route element={<ProtectedRoute allow={["ADMIN"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
