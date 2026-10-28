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
  await page.getByLabel("Your name").fill("Test Person");
  await page.getByLabel("Contact number").fill("+2651234567");
  await page.getByRole("button", { name: "Review locally" }).click();
  await expect(
    page.getByRole("heading", { name: "Review your draft" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Requests unavailable" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Accept quote unavailable" }),
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
  await page
    .locator("img")
    .evaluateAll((images) =>
      Promise.all(
        images.map((image) =>
          (image as HTMLImageElement).decode().catch(() => {}),
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
    page.getByRole("button", { name: "Review locally" }),
  ).toBeDisabled();
  await context.close();
});
