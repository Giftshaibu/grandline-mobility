import { render, screen, fireEvent } from "@testing-library/react";
import { it, expect, vi } from "vitest";
import { useState } from "react";
import { RideForm } from "../src/components/ride-form";
import { emptyRide } from "../src/lib/ride-draft";
function Form() {
  const [draft, setDraft] = useState(emptyRide());
  return (
    <RideForm
      draft={draft}
      setDraft={setDraft}
      editing={null}
      saved={vi.fn()}
    />
  );
}
it("focuses the first invalid route field and preserves route values when going back", async () => {
  render(<Form />);
  fireEvent.click(await screen.findByRole("button", { name: "Continue" }));
  expect(screen.getByLabelText("Pickup location")).toHaveFocus();
  fireEvent.change(screen.getByLabelText("Pickup location"), {
    target: { value: "Market" },
  });
  fireEvent.change(screen.getByLabelText("Destination", { exact: true }), {
    target: { value: "University" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
  expect(
    screen.getByRole("heading", { name: "Choose your ride" }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(screen.getByLabelText("Pickup location")).toHaveValue("Market");
});
