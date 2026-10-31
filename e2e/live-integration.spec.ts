import { test, expect } from "@playwright/test";
test.skip(
  !process.env["MOBILITY_LIVE_TEST"],
  "Requires the isolated opt-in live test build, never production data.",
);
const id = "12345678-1234-4234-8234-123456789012";
const fixture = {
  id,
  slug: "e2e-fixture-hire",
  kind: "hire",
  title: "E2E fixture hire",
  description: "Isolated public contract fixture.",
  location: "Mzuzu",
  category: "car",
  images: [],
  provider: {
    id,
    slug: "e2e-fixture-business",
    name: "E2E fixture provider",
    description: "Isolated fixture business.",
    location: "Mzuzu",
    serviceArea: [],
    images: [],
    contact: {},
  },
  passengerCapacity: 4,
  price: { amount: 45000, currency: "MWK", unit: "day" },
};
test("live catalogue uses real API shapes and keeps auth requirements on enquiry", async ({
  page,
}) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(
        url.pathname.endsWith("capabilities")
          ? { mobility: { discovery: true, enquiries: true }, rides: true }
          : url.pathname.endsWith(fixture.slug)
            ? fixture
            : { items: [fixture], nextCursor: null },
      ),
    });
  });
  await page.goto("/hire?q=fixture", { waitUntil: "domcontentloaded" });
  await expect(
    page.getByRole("heading", { name: "E2E fixture hire" }),
  ).toBeVisible();
  await expect(page.getByLabel("Sample catalogue")).toHaveCount(0);
  await page.getByRole("link", { name: "View details" }).click();
  await expect(
    page.getByRole("heading", { name: "E2E fixture provider" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Account access is not configured for this deployment. Public browsing remains available.",
    ),
  ).toBeVisible();
});
test("live empty, error and disabled states never substitute samples", async ({
  page,
}) => {
  let state = "empty";
  await page.route("**/api/v1/**", async (route) => {
    const capability = route.request().url().endsWith("capabilities");
    await route.fulfill({
      status: !capability && state === "error" ? 500 : 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(
        capability
          ? {
              mobility: { discovery: state !== "disabled", enquiries: true },
              rides: true,
            }
          : { items: [], nextCursor: null },
      ),
    });
  });
  await page.goto("/hire");
  await expect(page.getByText("No matches for this search.")).toBeVisible();
  state = "error";
  await page.reload();
  await expect(page.getByText("The directory couldn't load.")).toBeVisible();
  state = "disabled";
  await page.reload();
  await expect(page.getByText("We're preparing this directory.")).toBeVisible();
  await expect(page.getByLabel("Sample catalogue")).toHaveCount(0);
});
test("failed maps preserve the manual ride journey", async ({ page }) => {
  await page.route("https://maps.googleapis.com/**", (route) => route.abort());
  await page.goto("/ride?type=taxi");
  await page.getByRole("button", { name: "Open Google Maps" }).click();
  await expect(
    page.getByText(
      "Map search is unavailable. Typed addresses and landmarks still work.",
    ),
  ).toBeVisible();
  await page.getByLabel("Pickup location").fill("Manual fixture pickup");
  await page
    .getByLabel("Destination", { exact: true })
    .fill("Manual fixture destination");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Choose your ride" }),
  ).toBeVisible();
});
