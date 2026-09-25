import { test } from "@playwright/test"
import { signedInPage } from "../mock/mock-api"

test("professor can add a student to a subject", async ({ page }) => {
  await signedInPage(page, "PROFESSOR")
  await page.goto("/subjects/1?tab=members")
  await page.getByRole("button", { name: "Add member" }).click()
  await page.getByRole("checkbox", { name: "Student User" }).click()
  const request = page.waitForRequest(request => request.url().endsWith("/api/subjects/1/members/3") && request.method() === "POST")
  await page.getByRole("button", { name: "Add (1)" }).click()
  await request
})

test("admin can add a professor to a subject", async ({ page }) => {
  await signedInPage(page, "ADMIN")
  await page.goto("/subjects/1?tab=members")
  await page.getByRole("button", { name: "Add member" }).click()
  await page.getByRole("checkbox", { name: "Professor User" }).click()
  const request = page.waitForRequest(request => request.url().endsWith("/api/subjects/1/members/2") && request.method() === "POST")
  await page.getByRole("button", { name: "Add (1)" }).click()
  await request
})
