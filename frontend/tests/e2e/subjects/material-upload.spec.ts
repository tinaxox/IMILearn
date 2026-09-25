import { expect, test } from "@playwright/test"
import { signedInPage } from "../mock/mock-api"

test("professor can add a lecture document", async ({ page }) => {
  await signedInPage(page, "PROFESSOR")
  await page.goto("/subjects/1?tab=materials")
  await page.getByRole("button", { name: "Add material" }).click()
  await page.locator("#material-name").fill("Lecture 1")
  await page.locator("#material-file").setInputFiles({ name: "lecture.pdf", mimeType: "application/pdf", buffer: Buffer.from("lecture") })
  await expect(page.getByText("lecture.pdf")).toBeVisible()
  const request = page.waitForRequest(request => request.url().endsWith("/api/materials") && request.method() === "POST")
  await page.getByRole("button", { name: "Add material" }).last().click()
  await request
})
