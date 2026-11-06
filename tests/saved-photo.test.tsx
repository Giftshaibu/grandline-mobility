import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
vi.mock("../src/lib/business-api", () => ({ businessRequest: vi.fn() }));
import { businessRequest } from "../src/lib/business-api";
import { SavedApplicationPhoto } from "../src/components/saved-application-photo";

it("requests an owner-authorized preview explicitly and never sends the session token to the image", async () => {
  vi.mocked(businessRequest).mockResolvedValue({ url: "https://storage.example.test/private-photo?signature=test", expiresAt: "2026-11-06T12:00:00Z" });
  render(<SavedApplicationPhoto product="mobility" applicationId="application" mediaId="photo" filename="photo.jpg" session={{ staff: false, getToken: async () => "private-token" }} />);
  expect(businessRequest).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Preview saved photo: photo.jpg" }));
  const image = await screen.findByRole("img", { name: "Saved photo: photo.jpg" });
  expect(businessRequest).toHaveBeenCalledWith("/mobility/applications/application/media/photo/read", expect.anything(), "private-token");
  expect(image.getAttribute("src")).not.toContain("private-token");
  expect(image).toHaveAttribute("referrerpolicy", "no-referrer");
  fireEvent.error(image);
  expect(screen.getByRole("alert")).toHaveTextContent("expired");
  expect(screen.getByRole("button", { name: "Preview saved photo: photo.jpg" })).toBeEnabled();
});
