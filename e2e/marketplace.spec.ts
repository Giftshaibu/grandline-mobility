import { test, expect } from "@playwright/test";
test("marketplace search and responsive menu", async ({ page }, info) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await page.getByRole("button", { name: "Open search", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("What are you looking for?").fill("test search");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Search", exact: true })
    .click();
  await expect(page).toHaveURL(/q=test/);
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  }
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("heavy-duty filters and pickup draft never submit", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST" || r.url().includes("/api/v1/"))
      requests.push(r.url());
  });
  await page.goto("/heavy-duty?category=tipper", {
    waitUntil: "domcontentloaded",
  });
  await expect(
    page.getByRole("heading", { name: "Heavy-duty hire", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Vehicle category")).toHaveValue("tipper");
  await page.goto("/bike-pickup", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await page.getByLabel("Pickup location").fill("Market");
  await page.getByLabel("Destination", { exact: true }).fill("Town");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Contact name", { exact: true }).fill("Test Person");
  await page.getByLabel("Contact phone", { exact: true }).fill("+2651234567");
  await page.getByRole("checkbox").check();
  await expect(
    page.getByRole("button", { name: "Submission unavailable", exact: true }),
  ).toBeDisabled();
  expect(requests).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("marketplace page visual and category navigation", async ({
  page,
}, info) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  if (info.project.name === "desktop") {
    const menu = page
      .getByRole("navigation", { name: "Main navigation" })
      .locator("details")
      .first();
    await menu.locator("summary").click();
    await expect(menu.locator(".nav-categories a").first()).toBeVisible();
    await menu.locator(".nav-categories a").first().click();
    await expect(page).toHaveURL(/category=/);
  }
  await page.goto("/bike-pickup", { waitUntil: "domcontentloaded" });
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
    path: info.outputPath("journey.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("local pickup review is disabled without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/bike-pickup", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
  await context.close();
});
