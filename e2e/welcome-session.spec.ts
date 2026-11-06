import { test, expect } from "@playwright/test";

test("a welcome choice stays dismissed through navigation and refresh", async ({ page }) => {
  await page.goto("/");
  const welcome = page.locator(".grandline-welcome");
  await expect(welcome).toBeVisible();
  await welcome.getByRole("link", { name: /List transport/ }).click();
  await expect(page).toHaveURL(/\/list$/);
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await expect(welcome).not.toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await expect(welcome).not.toBeVisible();
  await page.goto("/hire");
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await expect(welcome).not.toBeVisible();
});

test("listing entry is discoverable on desktop and mobile after dismissing welcome", async ({ page }, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Just browsing", exact: true }).click();
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: /^List your offering/ }).click();
  } else {
    const entry = page.locator(".grandline-header-row").getByRole("link", { name: "List your offering", exact: true });
    await expect(entry).toBeVisible();
    await entry.click();
  }
  await expect(page).toHaveURL(/\/list$/);
  await expect(page.locator(".grandline-welcome")).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
