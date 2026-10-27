import { test, expect } from "@playwright/test";
test("public discovery criteria survive reload without fake API requests", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/v1/")) requests.push(r.url());
  });
  await page.goto("/hire");
  await expect(
    page.getByRole("heading", { name: "Vehicle hire", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Vehicle or provider").fill("repair");
  await page.getByLabel("Location", { exact: true }).fill("Lilongwe");
  await page.getByRole("button", { name: "Explore vehicles" }).click();
  await expect(page).toHaveURL(/q=repair/);
  await page.reload();
  await expect(page.getByLabel("Vehicle or provider")).toHaveValue("repair");
  await expect(
    page.getByText("Directory coming soon", { exact: true }),
  ).toBeVisible();
  expect(requests).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.getByLabel("Vehicle or provider")).toHaveValue("");
});
test("details cannot submit unavailable enquiries", async ({ page }) => {
  await page.goto("/hire/not-a-real-listing");
  await expect(
    page.getByRole("button", { name: "Enquiries unavailable" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Directory coming soon", { exact: true }),
  ).toBeVisible();
});
test("missing routes use the not-found boundary", async ({ page }) => {
  await page.goto("/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
test("homepage category navigation and keyboard access", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.getByRole("link", { name: /Explore vehicle hire/ }).click();
  await expect(page).toHaveURL(/hire/);
});
