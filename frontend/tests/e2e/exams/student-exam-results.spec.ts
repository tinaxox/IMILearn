import { expect, test } from "@playwright/test"
import { signedInPage } from "../mock/mock-api"

test("student sees their exam points and scheduled exam", async ({ page }) => {
  await signedInPage(page, "STUDENT")
  await page.goto("/subjects/1?tab=exams")
  await expect(page.getByRole("cell", { name: "Midterm", exact: true }).first()).toBeVisible()
  await expect(page.getByText("25")).toBeVisible()
  await expect(page.getByText("30")).toBeVisible()
})

test("student sees exams scheduled for their subject", async ({ page }) => {
  await signedInPage(page, "STUDENT")
  await page.goto("/subjects/1?tab=exams")
  await expect(page.getByRole("cell", { name: "Midterm", exact: true }).first()).toBeVisible()
  await expect(page.getByText("01/12/2026", { exact: false })).toBeVisible()
})
