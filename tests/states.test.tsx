import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Availability } from "../src/components/availability";
import { Enquiry } from "../src/components/enquiry";
describe("honest integration states", () => {
  it("shows unavailable support without claiming zero results", () => {
    render(<Availability result={{ state: "unavailable" }} />);
    expect(screen.getByText("Directory coming soon")).toBeVisible();
    expect(screen.queryByText(/No providers match/)).not.toBeInTheDocument();
  });
  it("announces loading", () => {
    render(<Availability pending />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });
  it("provides a retry action on failure", () => {
    const retry = vi.fn();
    render(
      <Availability
        result={{ state: "error", reason: "network" }}
        retry={retry}
      />,
    );
    screen.getByRole("button", { name: "Try again" }).click();
    expect(retry).toHaveBeenCalledOnce();
    expect(screen.getByRole("alert")).toBeVisible();
  });
  it("renders missing detail without fabricating profile information", () => {
    render(<Availability result={{ state: "not-found" }} />);
    expect(screen.getByText("Listing not found")).toBeVisible();
  });
  it("disables enquiry fields and never claims submission", () => {
    render(<Enquiry />);
    expect(
      screen.getByRole("button", { name: "Enquiries unavailable" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Your name")).toBeDisabled();
    expect(
      screen.getByText(/Nothing entered here is sent or saved/),
    ).toBeVisible();
  });
});
