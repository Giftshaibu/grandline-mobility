import { render, screen, fireEvent } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MobilityCard } from "../src/components/mobility-card";
import { MobilityBrowser } from "../src/components/mobility-browser";
import { entrySchema } from "../src/lib/contracts";
import { hire, commercial, logistics } from "./fixtures";
it("validates and renders hire pricing and passenger capacity", () => {
  render(<MobilityCard entry={entrySchema.parse(hire)} />);
  expect(screen.getByText("MK50,000 / day")).toBeVisible();
  expect(screen.getByText("5 passengers")).toBeVisible();
  expect(screen.getByRole("link", { name: "View details" })).toHaveAttribute(
    "href",
    "/hire/fixture-hire",
  );
});
it("renders commercial carrying capacity", () => {
  render(<MobilityCard entry={entrySchema.parse(commercial)} />);
  expect(screen.getByText("3,000 kg carrying capacity")).toBeVisible();
});
it("renders logistics areas without inventing pricing", () => {
  render(<MobilityCard entry={entrySchema.parse(logistics)} />);
  expect(screen.getByText("Mzuzu · Lilongwe")).toBeVisible();
  expect(screen.queryByText(/MK/)).not.toBeInTheDocument();
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
});
it("uses logistics-specific search labels and honest unavailable state", async () => {
  const submit = vi.fn();
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MobilityBrowser kind="logistics" search={{}} onSearch={submit} />
    </QueryClientProvider>,
  );
  fireEvent.change(screen.getByLabelText("Service area"), {
    target: { value: "Mzuzu" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Find transport" }));
  expect(submit).toHaveBeenCalledWith({ location: "Mzuzu" });
  expect(await screen.findByText("Directory coming soon")).toBeVisible();
  expect(screen.queryByLabelText("Passenger capacity")).not.toBeInTheDocument();
});
it("rejects fractional currency and malformed images", () => {
  expect(
    entrySchema.safeParse({ ...hire, price: { ...hire.price, amount: 0.5 } })
      .success,
  ).toBe(false);
  expect(
    entrySchema.safeParse({ ...hire, images: ["not a URL"] }).success,
  ).toBe(false);
});
