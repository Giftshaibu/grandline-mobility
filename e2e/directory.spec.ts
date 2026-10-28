import { test, expect } from "@playwright/test";
test("public discovery criteria survive reload without fake API requests", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/v1/")) requests.push(r.url());
  });
  await page.goto("/hire", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true", {
    timeout: 30000,
  });
  await expect(
    page.getByRole("heading", { name: "Vehicle hire", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Vehicle or provider").fill("repair");
  await page.getByLabel("Location", { exact: true }).fill("Lilongwe");
  await page.getByRole("button", { name: "Explore vehicles" }).click();
  await expect(page).toHaveURL(/q=repair/);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true", {
    timeout: 30000,
  });
  await expect(page.getByLabel("Vehicle or provider")).toHaveValue("repair");
  await expect(
    page.getByText("Directory coming soon", { exact: true }),
  ).toBeVisible();
  expect(requests).toEqual([]);
  expect(runtimeErrors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "Clear search" }).click();
  await expect(page.getByLabel("Vehicle or provider")).toHaveValue("");
});
test("details cannot submit unavailable enquiries", async ({ page }) => {
  await page.goto("/hire/not-a-real-listing", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("button", { name: "Enquiries unavailable" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Directory coming soon", { exact: true }),
  ).toBeVisible();
});
test("missing routes use the not-found boundary", async ({ page }) => {
  await page.goto("/does-not-exist", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
test("homepage category navigation and keyboard access", async ({
  page,
}, testInfo) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true", {
    timeout: 30000,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await page.locator("img").evaluateAll((images) =>
    Promise.all(
      images.map((image) =>
        (() => {
          const img = image as HTMLImageElement;
          img.loading = "eager";
          return img.decode().catch(() => {});
        })(),
      ),
    ),
  );
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page
    .getByRole("link", { name: /Explore vehicle hire/ })
    .first()
    .click();
  await expect(page).toHaveURL(/hire/);
});

test("known unavailable state renders without client JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/hire/not-a-real-listing", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByText("Directory coming soon", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enquiries unavailable" }),
  ).toBeDisabled();
  await page.goto("/hire?q=repair&location=Lilongwe", {
    waitUntil: "domcontentloaded",
  });
  await page.getByRole("link", { name: "Clear search" }).click();
  await expect(page.getByLabel("Vehicle or provider")).toHaveValue("");
  await expect(page).not.toHaveURL(/q=repair/);
  await context.close();
});
