import { test, expect } from "@playwright/test";
const cases = [
  {
    type: "hire",
    category: "car",
    title: "Test hire car",
    terms: "Hire or transport terms",
    fee: "50,000",
  },
  {
    type: "heavy-duty",
    category: "lorry",
    title: "Test lorry",
    terms: "Hire or transport terms",
    fee: "25,000",
  },
  {
    type: "commercial",
    category: "truck",
    title: "Test commercial truck",
    terms: "Hire or transport terms",
    fee: "25,000",
  },
  {
    type: "logistics",
    category: "delivery",
    title: "Test delivery service",
    terms: "Cargo types and service details",
    fee: "50,000",
  },
  {
    type: "bike-operator",
    category: "motorcycle",
    title: "Test bike operator",
    terms: "Motorcycle and service details",
    fee: "10,000",
  },
];
for (const item of cases)
  test(`${item.type} application reaches review without transmission`, async ({
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
    await page.goto("/list", { waitUntil: "domcontentloaded" });
    await page
      .getByLabel("Listing type", { exact: true })
      .selectOption(item.type);
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByLabel("Business/operator type").selectOption("company");
    await page
      .getByLabel("Business or operator name")
      .fill("Test Mobility Business");
    await page.getByLabel("Base location").fill("Lilongwe");
    await page
      .getByLabel("Service areas", { exact: true })
      .fill("Lilongwe, Blantyre");
    await page
      .getByLabel("Business/operator description")
      .fill("A test transport business offering mobility services.");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByLabel(
        item.type === "logistics"
          ? "Transport service title"
          : item.type === "bike-operator"
            ? "Motorcycle offering title"
            : "Vehicle or equipment title",
      )
      .fill(item.title);
    await page.getByLabel("Offering category").selectOption(item.category);
    if (item.type !== "logistics") {
      await page
        .getByLabel(
          item.type === "heavy-duty"
            ? "Equipment or vehicle make"
            : "Vehicle make",
          { exact: true },
        )
        .fill("Test make");
      await page.getByLabel("Model", { exact: true }).fill("Test model");
      await page.getByLabel("Year (optional)").fill("2020");
      if (item.type === "hire" || item.type === "commercial")
        await page.getByLabel("Passenger capacity (optional)").fill("5");
      if (item.type === "heavy-duty" || item.type === "commercial")
        await page.getByLabel("Load capacity (kg) (optional)").fill("12000");
      if (item.type === "heavy-duty")
        await page.getByLabel("Operator inclusion").selectOption("included");
    } else
      await expect(
        page.getByLabel("Vehicle make", { exact: true }),
      ).toHaveCount(0);
    await page
      .getByLabel(item.terms, { exact: true })
      .fill("Test offering details and terms for staff to review.");
    if (item.type !== "bike-operator")
      await page.getByLabel("Advertised rate (MWK) (optional)").fill("45000");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(
      page.getByText("Photos are optional", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByLabel("Contact name", { exact: true })
      .fill("Test Applicant");
    await page.getByLabel("Contact phone").fill("+2651234567");
    await page.getByLabel("Contact email").fill("operator@example.test");
    await page.getByRole("button", { name: "Review application" }).click();
    await expect(
      page.getByRole("button", { name: "Submission unavailable", exact: true }),
    ).toBeDisabled();
    await expect(page.getByText(item.title, { exact: true })).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: "Monthly listing fee guidance" }),
    ).toContainText(item.fee);
    expect(writes).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (item.type === "hire") {
      await page
        .getByRole("button", { name: "Edit listing type", exact: true })
        .click();
      await page
        .getByLabel("Listing type", { exact: true })
        .selectOption("logistics");
      await page
        .getByRole("button", { name: "Save changes & return to review" })
        .click();
      await expect(page.getByLabel("Transport service title")).toBeFocused();
      await expect(
        page.getByLabel("Vehicle make", { exact: true }),
      ).toHaveCount(0);
      await page
        .getByLabel("Transport service title")
        .fill("Changed logistics service");
      await page.getByLabel("Offering category").selectOption("goods");
      await page
        .getByLabel("Cargo types and service details")
        .fill("Transport packaged goods between the listed service areas.");
      await page
        .getByRole("button", { name: "Save changes & return to review" })
        .click();
      await expect(
        page.getByText("Test Mobility Business", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByText("Changed logistics service", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("complementary", {
          name: "Monthly listing fee guidance",
        }),
      ).toContainText("needs staff confirmation");
    }
    if (item.type === "bike-operator") {
      await page.screenshot({
        path: info.outputPath("bike-application-review.png"),
        fullPage: true,
      });
      await page.getByRole("button", { name: "Reset draft" }).click();
      await expect(
        page.getByLabel("Listing type", { exact: true }),
      ).toHaveValue("");
    }
  });
test("listing preview is disabled without JavaScript and linked in navigation", async ({
  browser,
  page,
}, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJs = await context.newPage();
  await noJs.goto("/list", { waitUntil: "domcontentloaded" });
  await expect(
    noJs.getByRole("button", { name: "Continue", exact: true }),
  ).toBeDisabled();
  await context.close();
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  if (info.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu", exact: true }).click();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: /List your offering/ })
      .click();
  } else
    await page
      .locator("header")
      .getByRole("link", { name: "List your offering", exact: true })
      .click();
  await expect(page).toHaveURL(/\/list$/);
});

test("page exit clears the temporary application draft", async ({ page }) => {
  await page.goto("/list", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Listing type", { exact: true }).selectOption("hire");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Business or operator name")
    .fill("Temporary private draft");
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  await expect(page.getByLabel("Listing type", { exact: true })).toHaveValue(
    "",
  );
  await page.getByLabel("Listing type", { exact: true }).selectOption("hire");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByLabel("Business or operator name")).toHaveValue("");
});
