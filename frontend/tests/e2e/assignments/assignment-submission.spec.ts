import { expect, test } from "@playwright/test"
import { signedInPage } from "../mock/mock-api"

test("student submits an assignment with text and a file", async ({ page }) => {
  await signedInPage(page, "STUDENT")
  await page.goto("/assignments/4")
  await page.locator("#submission-text").fill("My completed implementation")
  await page.locator("#submission-files").setInputFiles({ name: "solution.pdf", mimeType: "application/pdf", buffer: Buffer.from("solution") })
  await expect(page.getByText("solution.pdf")).toBeVisible()
  const request = page.waitForRequest(request => request.url().endsWith("/api/assignments/4/submission") && request.method() === "PUT")
  await page.getByRole("button", { name: "Submit assignment" }).click()
  await request
})
