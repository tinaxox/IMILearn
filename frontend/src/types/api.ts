export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type UserType = "STUDENT" | "PROFESSOR" | "ADMIN"

export interface User {
  id: number
  email: string
  name: string
  surname: string
  type: UserType
  espb: number | null
  score: number | null
  year: number | null
  index: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  id: number
  token: string
  email: string
  name: string
  surname: string
  type: UserType
  espb: number | null
  score: number | null
  year: number | null
  index: string | null
}

export type CurrentUserResponse = Omit<AuthResponse, "token">

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  surname: string
}

export interface UserRequest {
  email: string
  password: string
  name: string
  surname: string
  type: UserType
  espb: number | null
  score: number | null
  year: number | null
  index: string | null
}

export interface UserUpdateRequest {
  email: string
  password?: string
  name: string
  surname: string
  type: UserType
  espb: number | null
  score: number | null
  year: number | null
  index: string | null
}

export interface Subject {
  id: number
  name: string
  year: number
  professorName: string | null
  memberCount: number
  createdAt: string
  updatedAt: string
}

export interface SubjectRequest {
  name: string
  year: number
}

export type MaterialType = "DOCUMENT" | "VIDEO" | "IMAGE" | "LINK" | "OTHER"
export type MaterialCategory = "LECTURE" | "EXERCISES" | "EXAM_QUESTIONS" | "OTHER"

export interface Material {
  id: number
  type: MaterialType
  category: MaterialCategory
  path: string
  name: string
  subjectId: number
  createdAt: string
  updatedAt: string
}

export interface MaterialRequest {
  type: MaterialType
  category: MaterialCategory
  path: string
  name: string
  subjectId: number
}

export interface MaterialUploadUrlRequest {
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface MaterialUploadUrlResponse {
  url: string
  storageKey: string
  expiresAt: string
}

export type UploadUrl = MaterialUploadUrlResponse

export interface Assignment {
  id: number
  title: string
  description: string
  dueDate: string
  maxPoints: number | null
  subjectId: number
  createdAt: string
  updatedAt: string
}

export interface AssignmentRequest {
  title: string
  description: string
  dueDate: string
  subjectId: number
}

export interface SubmissionFile {
  id: number
  fileName: string
  storageKey: string
  contentType: string
  sizeBytes: number
  createdAt: string
}

export interface SubmissionFileRequest {
  storageKey: string
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface SubmissionUploadUrlRequest {
  fileName: string
  contentType: string
  sizeBytes: number
}

export interface SubmissionUploadUrlResponse {
  url: string
  storageKey: string
  expiresAt: string
}

export interface SubmitAssignmentRequest {
  files: SubmissionFileRequest[]
}

export interface AssignmentSubmission {
  id: number
  assignmentId: number
  studentId: number
  studentEmail: string
  studentName: string
  studentSurname: string
  points: number | null
  textContent: string | null
  files: SubmissionFile[]
  createdAt: string
  updatedAt: string
}

export interface GradeSubmissionRequest {
  points: number
}

export interface DownloadUrl {
  url: string
  expiresAt: string
}

export interface Exam {
  id: number
  name: string
  date: string
  type: "MIDTERM" | "FINAL" | "OTHER"
  maxPoints: number | null
  subjectId: number
  subjectName: string
  createdAt: string
  updatedAt: string
}

export interface ExamRequest {
  name: string
  date: string
  type: "MIDTERM" | "FINAL" | "OTHER"
  maxPoints: number | null
  subjectId: number
}

export interface ForumThread {
  id: number
  title: string
  body: string
  attachmentStorageKey?: string | null
  attachmentFileName?: string | null
  attachmentContentType?: string | null
  attachmentSizeBytes?: number | null
  subjectId: number
  authorId: number
  authorName: string
  createdAt: string
  postCount: number
}

export interface ForumPost {
  id: number
  threadId: number
  authorId: number
  authorName: string
  body: string
  createdAt: string
}

export interface ForumThreadRequest {
  title: string
  body: string
  attachmentStorageKey?: string | null
  attachmentFileName?: string | null
  attachmentContentType?: string | null
  attachmentSizeBytes?: number | null
}

export interface ForumPostRequest {
  body: string
}

export type NotificationType = "SUBJECT_MEMBER_ADDED" | "ASSIGNMENT_CREATED" | "EXAM_SCHEDULED" | "EXAM_TIME_CHANGED" | "ASSIGNMENT_GRADED" | "EXAM_GRADED" | "FORUM_THREAD_CREATED" | "FORUM_POST_CREATED" | "FORUM_MENTION"

export interface NotificationResponse {
  id: number
  type: NotificationType
  title: string
  message: string
  subjectId: number | null
  referenceId: number | null
  read: boolean
  createdAt: string
}

export interface StudentExamGrade {
  examId: number
  examName: string
  examDate: string
  examType: "MIDTERM" | "FINAL" | "OTHER"
  maxPoints: number | null
  points: number | null
  grade: number | null
}

export interface ExamGrade {
  examId: number
  studentId: number
  studentEmail: string
  studentName: string
  studentSurname: string
  studentIndex: string | null
  studentYear: number | null
  points: number | null
  grade: number | null
}

export interface QuizOption {
  index: number
  label: string
}

export interface QuizQuestion {
  text: string
  options: QuizOption[]
}

export interface Quiz {
  id: number
  title: string
  subjectId: number
  createdByUserId: number
  questions: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

export interface QuizRequest {
  title: string
  subjectId: number
  questions: QuizQuestion[]
  correctOptionIndexes: number[]
}

export interface SubmitQuizRequest {
  submittedOptionIndexes: (number | null)[]
}

export interface QuizResultEntry {
  questionIndex: number
  correctOptionIndex: number
  submittedOptionIndex: number | null
  correct: boolean
}

export interface QuizSubmission {
  id: number
  quizId: number
  quizTitle: string
  score: number
  correctCount: number
  totalQuestions: number
  result: QuizResultEntry[]
  createdAt: string
}

export type GenerationStatus = "PENDING" | "RUNNING" | "FAILED" | "SUCCESS"

export interface QuizGenerationRequestBody {
  materialIds: number[]
  questionCount: number
  title: string
}

export interface QuizGenerationStep {
  materialId: number
  status: GenerationStatus
  retryCount: number
  errorMessage: string | null
}

export interface QuizGenerationStatus {
  id: number
  title: string
  subjectId: number
  status: GenerationStatus
  resultQuizId: number | null
  errorMessage: string | null
  materialSteps: QuizGenerationStep[]
  createdAt: string
  updatedAt: string
}

export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
}
