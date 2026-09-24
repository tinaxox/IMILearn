# Backend gaps found during the frontend redesign

The backend is largely complete and already role-scoped. These are the only gaps found while reviewing controllers/DTOs against the frontend needs — nothing here blocks the redesign itself, but they should be tracked.

1. **`AssignmentSubmission` DTO/type mismatch (frontend-only fix, already applied)** — `AssignmentSubmissionResponse` on the backend has a `points` field, but `frontend/src/types/api.ts` was missing it, so the UI couldn't show a student's assignment grade. Added `points: number | null` to `AssignmentSubmission` and a `GradeSubmissionRequest` type in `frontend/src/types/api.ts`. No backend change needed.

2. **No "my subjects" convenience endpoint** — `GET /api/subjects` already appears to scope results by the current user (professors/students only see their own subjects per `SubjectServiceImpl`), so this is likely fine as-is. Worth double-checking that professors seeing "their subjects" and students seeing "subjects they're a member of" both fall out of the same `findAll` correctly, since the spec calls these out as distinct initial-page views.

3. **No aggregated "grades per student per exam" grid endpoint** — `GET /api/exams/{examId}/grades` returns grades for one exam, and `GET /api/exams/my-grades?subject=` returns a student's own grades for a subject. Building the professor-facing "grades for each user in a subject per exam" matrix therefore requires the frontend to fetch the exam list for a subject and then call `/grades` once per exam client-side. Functional, but a single batched endpoint (e.g. `GET /api/subjects/{id}/grades`) would be more efficient if this view ends up slow with many exams.

4. **No "mark material as viewed" write path was found besides the read path itself** — `MaterialServiceImpl.recordView` is called from `findById`, so simply opening a material's detail marks it viewed. This matches how the frontend already uses it (no action needed), just noting it so the redesign doesn't try to add an explicit "mark as viewed" button/call that doesn't exist.

5. **Practice quiz generation status polling** — `QuizGenerationController` exposes create/list/get-by-id for generation jobs (`status: PENDING/RUNNING/FAILED/SUCCESS`), but there's no push/webhook — the frontend must poll `GET /api/quiz-generations/{id}` for status. Confirm the redesign's practice-quiz-from-materials flow polls at a reasonable interval rather than assuming a single request completes synchronously.

None of the above required backend changes for the redesign to proceed — the redesign is UI-only, using the existing endpoints as-is.
