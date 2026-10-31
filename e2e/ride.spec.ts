import { test, expect } from "@playwright/test";
for (const kind of ["bike", "taxi"])
  test(`${kind} journey validates, schedules and reviews without invented submission`, async ({
    page,
  }, info) => {
    const writes: string[] = [];
    page.on("request", (request) => {
      if (
        ["POST", "PUT", "PATCH", "DELETE"].includes(request.method()) ||
        request.url().includes("/api/v1/")
      )
        writes.push(request.url());
    });
    await page.goto(`/ride?type=${kind}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveAttribute(
      "data-app-ready",
      "true",
    );
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByLabel("Pickup location")).toBeFocused();
    await page.getByLabel("Pickup location").fill("Fixture market entrance");
    await page
      .getByLabel("Destination", { exact: true })
      .fill("Fixture university gate");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(
      page.getByRole("radio", { name: kind === "bike" ? /Bike/ : /Taxi/ }),
    ).toBeChecked();
    await page.getByLabel("Pickup timing").selectOption("scheduled");
    await page.getByLabel(/Pickup date and time/).fill("2030-11-10T14:30");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByLabel("Contact name", { exact: true })
      .fill("Fixture customer");
    await page
      .getByLabel("Contact phone", { exact: true })
      .fill("+265999000000");
    await page.getByRole("checkbox").check();
    await expect(
      page.getByRole("heading", { name: "Review your journey" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Submission unavailable", exact: true }),
    ).toBeDisabled();
    expect(writes).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`${kind}-review.png`),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Back", exact: true }).click();
    await expect(page.getByLabel(/Pickup date and time/)).toHaveValue(
      "2030-11-10T14:30",
    );
  });
test("legacy pickup redirects to bikes and denied geolocation preserves manual entry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: (
          _success: unknown,
          error: (value: unknown) => void,
        ) => error({ code: 1 }),
      },
    });
  });
  await page.goto("/bike-pickup", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/ride\?type=bike/);
  await page
    .getByRole("button", { name: "Use my location for pickup" })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Enter your pickup address manually",
  );
  await page.getByLabel("Pickup location").fill("Manual pickup");
  await expect(page.getByLabel("Pickup location")).toHaveValue("Manual pickup");
});
