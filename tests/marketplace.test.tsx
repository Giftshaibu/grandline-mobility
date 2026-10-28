import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { entrySchema, bikeRequestSchema } from "../src/lib/contracts";
import { MobilityCard } from "../src/components/mobility-card";
import { hire } from "./fixtures";
it("supports supplied heavy-duty capacity without a rental availability claim", () => {
  const entry = entrySchema.parse({
    ...hire,
    kind: "heavy-duty",
    vehicleType: "Tipper",
    cargoCapacityKg: 12000,
    operatorIncluded: false,
  });
  render(<MobilityCard entry={entry} />);
  expect(screen.getByText("12,000 kg carrying capacity")).toBeVisible();
  expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
    "href",
    "/heavy-duty/fixture-hire",
  );
});
it("requires pickup and contact details and limits notes", () => {
  expect(
    bikeRequestSchema.safeParse({
      pickup: "",
      destination: "Town",
      name: "Test",
      phone: "123",
    }).success,
  ).toBe(false);
  expect(
    bikeRequestSchema.safeParse({
      pickup: "Market",
      destination: "Town",
      name: "Test",
      phone: "+2651234567",
    }).success,
  ).toBe(true);
  expect(
    bikeRequestSchema.safeParse({
      pickup: "Market",
      destination: "Town",
      name: "Test",
      phone: "+2651234567",
      notes: "x".repeat(2001),
    }).success,
  ).toBe(false);
});
