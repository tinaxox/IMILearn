import type { Exam, MaterialCategory, MaterialType, UserType } from "@/types/api"

export const userTypeLabels: Record<UserType, string> = {
  STUDENT: "Student",
  PROFESSOR: "Professor",
  ADMIN: "Admin",
}

export const materialTypeLabels: Record<MaterialType, string> = {
  DOCUMENT: "Document",
  VIDEO: "Video",
  IMAGE: "Image",
  LINK: "Link",
  OTHER: "Other",
}

export const materialCategoryLabels: Record<MaterialCategory, string> = {
  LECTURE: "Lecture",
  EXERCISES: "Exercises",
  EXAM_QUESTIONS: "Exam questions",
  OTHER: "Not specified",
}

export const examTypeLabels: Record<Exam["type"], string> = {
  MIDTERM: "Midterm",
  FINAL: "Final",
  OTHER: "Other",
}
