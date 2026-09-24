import type { Page } from "@playwright/test"
import type { UserType } from "../../../src/types/api"

const now = "2026-09-24T10:00:00.000Z"
const subject = { id: 1, name: "Web development", year: 2, professorName: "Professor User", memberCount: 2, createdAt: now, updatedAt: now }
const student = { id: 3, email: "student@example.test", name: "Student", surname: "User", type: "STUDENT", espb: 30, score: null, year: 2, index: "3/2025", createdAt: now, updatedAt: now }
const professor = { id: 2, email: "professor@example.test", name: "Professor", surname: "User", type: "PROFESSOR", espb: null, score: null, year: null, index: null, createdAt: now, updatedAt: now }

export async function signedInPage(page: Page, type: UserType, options: { examDate?: string; notifications?: unknown[] } = {}) {
  const current = type === "STUDENT" ? student : type === "PROFESSOR" ? professor : { ...professor, id: 1, type: "ADMIN", email: "admin@example.test" }
  await page.addInitScript((auth) => localStorage.setItem("imilearn.auth", JSON.stringify(auth)), { ...current, token: "e2e-token" })
  await page.route("**/e2e-upload/**", route => route.fulfill({ status: 200 }))
  await page.route("**/api/**", async route => {
    const url = new URL(route.request().url())
    const path = url.pathname.replace("/api", "")
    const method = route.request().method()
    const json = (body: unknown) => route.fulfill({ contentType: "application/json", body: JSON.stringify(body) })
    if (path === "/auth/me") return json(current)
    if (path === "/subjects/1") return json(subject)
    if (path === "/subjects/1/members") return json(current.type === "ADMIN" ? [student] : [professor])
    if (path === "/users") return json([professor, student])
    if (path === "/materials") return json({ content: [], totalElements: 0, totalPages: 1, number: 0, size: 100 })
    if (path === "/assignments") return json({ content: [], totalElements: 0, totalPages: 1, number: 0, size: 100 })
    if (path === "/assignments/4") return json({ id: 4, title: "Homework", description: "Submit your work", dueDate: "2026-12-15T10:00:00.000Z", maxPoints: null, subjectId: 1, createdAt: now, updatedAt: now })
    if (path === "/assignments/4/submission") return route.fulfill({ status: 404, contentType: "application/json", body: "{}" })
    if (path === "/exams") return json({ content: [{ id: 9, name: "Midterm", type: "MIDTERM", date: options.examDate ?? "2026-12-01T10:00:00.000Z", maxPoints: 30, subjectId: 1, subjectName: subject.name, createdAt: now, updatedAt: now }], totalElements: 1, totalPages: 1, number: 0, size: 100 })
    if (path === "/exams/my-grades") return json([{ examId: 9, examName: "Midterm", examDate: "2026-12-01T10:00:00.000Z", examType: "MIDTERM", maxPoints: 30, points: 25, grade: null }])
    if (path === "/exams/9/grades") return json([student, { ...student, id: 4, name: "Second", surname: "Student", email: "second@example.test" }].map(item => ({ examId: 9, studentId: item.id, studentEmail: item.email, studentName: item.name, studentSurname: item.surname, studentIndex: item.index, studentYear: item.year, points: null, grade: null })))
    if (path === "/notifications") return json({ content: options.notifications ?? [], totalElements: (options.notifications ?? []).length, totalPages: 1, number: 0, size: 10 })
    if (path === "/notifications/unread-count") return json({ count: 0 })
    if (method === "POST" && path === "/assignments") return json({ id: 12, ...(route.request().postDataJSON() as object), createdAt: now, updatedAt: now })
    if (method === "POST" && (path === "/materials/upload-url" || path.endsWith("/submission/upload-url"))) return json({ url: "http://127.0.0.1:4173/e2e-upload/file", storageKey: "e2e/file.pdf", expiresAt: now })
    if (method === "POST" && path === "/materials") return json({ id: 12, ...(route.request().postDataJSON() as object), createdAt: now, updatedAt: now })
    if (method === "PUT" && (path.endsWith("/submission") || path.includes("/grades/"))) return json({})
    if (method === "POST" && path.includes("/members/")) return json([professor, student])
    return json({})
  })
}
