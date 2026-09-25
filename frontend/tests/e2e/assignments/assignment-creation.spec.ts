import { expect, test } from "@playwright/test"
import { signedInPage } from "../mock/mock-api"

test("professor can create an assignment", async ({ page }) => {
  await signedInPage(page, "PROFESSOR")
  await page.goto("/subjects/1/assignments")
  await page.getByRole("button", { name: "Create assignment" }).click()
  await page.locator("#assignment-title").fill("Homework 1")
  await page.locator("#assignment-description").fill("Build the API client")
  await page.locator("#assignment-due-date").fill("2026-12-15T10:00")
  const request = page.waitForRequest(request => request.url().endsWith("/api/assignments") && request.method() === "POST")
  await page.getByRole("button", { name: "Create assignment" }).last().click()
  expect((await request).postDataJSON()).toMatchObject({ title: "Homework 1", subjectId: 1 })
})
