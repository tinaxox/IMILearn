import { test } from "@playwright/test"
import { signedInPage } from "../mock/mock-api"

test("professor can enter points for multiple students", async ({ page }) => {
  await signedInPage(page, "PROFESSOR", { examDate: "2025-12-01T10:00:00.000Z" })
  await page.goto("/subjects/1?tab=exams")
  await page.getByRole("button", { name: "View points" }).click()
  const inputs = page.getByPlaceholder("Enter points")
  await inputs.nth(0).fill("25")
  await inputs.nth(1).fill("20")
  const requests = Promise.all([3, 4].map(id => page.waitForRequest(request => request.url().endsWith(`/api/exams/9/grades/${id}`))))
  await page.getByRole("button", { name: "Save" }).click()
  await requests
})
