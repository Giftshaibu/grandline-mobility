import { render, screen, fireEvent } from "@testing-library/react";
import { it, expect, vi, afterEach } from "vitest";
vi.mock("../src/lib/google-maps-adapter", () => ({
  attachGoogleMap: vi
    .fn()
    .mockRejectedValue(
      new Error("Map unavailable. Type your locations instead."),
    ),
  attachPlaceSearch: vi.fn(),
}));
import { RideMap } from "../src/components/ride-map";
import { blankLocation } from "../src/lib/ride-draft";
afterEach(() => vi.unstubAllEnvs());
it("retains route summaries and manual-location guidance on map failure", async () => {
  vi.stubEnv("VITE_GOOGLE_MAPS_BROWSER_KEY", "isolated-test-key");
  render(
    <RideMap
      pickup={{ ...blankLocation(), address: "Customer pickup" }}
      destination={blankLocation()}
      onLocation={vi.fn()}
    />,
  );
  fireEvent.click(screen.getByText("Open Google Maps"));
  expect(
    await screen.findByText("Map unavailable. Type your locations instead."),
  ).toBeVisible();
  expect(screen.getByText("Customer pickup")).toBeVisible();
});
