import { expect, test } from "@playwright/test"
import { signedInPage } from "../mock/mock-api"

test("professor sees a forum mention notification", async ({ page }) => {
  await signedInPage(page, "PROFESSOR", { notifications: [{ id: 1, type: "FORUM_MENTION", title: "You were mentioned", message: "Student mentioned you in a reply", subjectId: 1, referenceId: 4, read: false, createdAt: "2026-09-24T10:00:00.000Z" }] })
  await page.goto("/subjects/1")
  await page.getByRole("button", { name: "Notifications" }).click()
  await expect(page.getByText("You were mentioned")).toBeVisible()
})

test("student sees a scheduled exam notification", async ({ page }) => {
  await signedInPage(page, "STUDENT", { notifications: [{ id: 2, type: "EXAM_SCHEDULED", title: "New exam scheduled: Midterm", message: "A new exam was scheduled", subjectId: 1, referenceId: 9, read: false, createdAt: "2026-09-24T10:00:00.000Z" }] })
  await page.goto("/subjects/1")
  await page.getByRole("button", { name: "Notifications" }).click()
  await expect(page.getByText("New exam scheduled: Midterm")).toBeVisible()
})
