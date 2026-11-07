import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ListingGallery } from "@grandline/ui/images";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
describe("shared listing image viewer", () => {
  it("expands the selected photo, zooms, navigates, resets and minimises", () => {
    render(
      <ListingGallery
        images={["/first.jpg", "/second.jpg"]}
        name="Test listing"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Show photo 2" }));
    const trigger = screen.getByRole("button", {
      name: "Maximise Test listing photo",
    });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Photo 2 of 2")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(
      screen.getByRole("button", { name: "Reset zoom" }),
    ).toHaveTextContent("150%");
    fireEvent.click(screen.getByRole("button", { name: "Previous photo" }));
    expect(screen.getByText("Photo 1 of 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reset zoom" }),
    ).toHaveTextContent("100%");
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
    fireEvent.click(
      screen.getByRole("button", { name: "Minimise image viewer" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });
  it("handles Escape and failed photos without a broken maximise action", () => {
    render(<ListingGallery images={["/first.jpg"]} name="Test listing" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Maximise Test listing photo" }),
    );
    fireEvent(
      screen.getByRole("dialog"),
      new Event("cancel", { bubbles: true, cancelable: true }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.error(screen.getByAltText("Test listing, photo 1"));
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Maximise/ }),
    ).not.toBeInTheDocument();
  });
  it("limits zoom and closes with its close button", () => {
    render(<ListingGallery images={["/first.jpg"]} name="Test listing" />);
    fireEvent.click(screen.getByRole("button", { name: /Maximise/ }));
    for (let index = 0; index < 8; index++)
      fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Reset zoom" }),
    ).toHaveTextContent("400%");
    fireEvent.click(screen.getByRole("button", { name: "Close image viewer" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
