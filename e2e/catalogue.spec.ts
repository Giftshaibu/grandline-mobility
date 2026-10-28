import { test, expect } from "@playwright/test";
test("header hover and chevron alignment", async ({ page }, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Hover requires a desktop pointer",
  );
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  const item = page
    .getByRole("navigation", { name: "Main navigation" })
    .locator("details")
    .first();
  await item.locator("summary").hover();
  await expect(item).toHaveAttribute("open", "");
  await expect(item.locator(".nav-dropdown")).toBeVisible();
  const aligned = await item.locator("summary").evaluate((summary) => {
    const text = summary.querySelector("span")!.getBoundingClientRect();
    const icon = summary.querySelector("svg")!.getBoundingClientRect();
    return Math.abs(text.y + text.height / 2 - icon.y - icon.height / 2) < 1;
  });
  expect(aligned).toBe(true);
  await item.locator(".nav-dropdown").hover();
  await expect(item.locator(".nav-dropdown")).toBeVisible();
  await page.locator("h1").hover();
  await expect(item).not.toHaveAttribute("open", "");
  await item.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(item).toHaveAttribute("open", "");
  await page.keyboard.press("Escape");
  await expect(item).not.toHaveAttribute("open", "");
});
test("sample catalogue can be filtered and explored without booking", async ({
  page,
}, info) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/v1/")) requests.push(request.url());
  });
  await page.goto("/hire", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await expect(
    page.getByRole("complementary", { name: "Sample catalogue notice" }),
  ).toBeVisible();
  await expect(page.locator(".sample-card")).toHaveCount(6);
  await page.getByLabel("Vehicle category").selectOption("car");
  await page.getByRole("button", { name: "Explore vehicles" }).click();
  await expect(page.locator(".sample-card")).toHaveCount(2);
  await page.locator("img").evaluateAll((images) =>
    Promise.all(
      images.map((image) => {
        const img = image as HTMLImageElement;
        img.loading = "eager";
        return img.decode().catch(() => {});
      }),
    ),
  );
  await page.screenshot({
    path: info.outputPath("catalogue.png"),
    fullPage: true,
  });
  await page
    .getByRole("link", { name: /View sample details/ })
    .first()
    .click();
  await expect(page).toHaveURL(/sample-/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Example",
  );
  await expect(
    page.getByRole("complementary", { name: "Sample catalogue notice" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enquiries unavailable" }),
  ).toBeDisabled();
  expect(requests).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
