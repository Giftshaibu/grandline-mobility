import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
vi.mock("../src/lib/business-api", async (original) => ({
  ...(await original<typeof import("../src/lib/business-api")>()),
  businessRequest: vi.fn(),
}));
import {
  businessRequest,
  type SavedApplication,
} from "../src/lib/business-api";
import { OwnerListingActions } from "../src/components/owner-listing-actions";
const request = vi.mocked(businessRequest);
const application: SavedApplication = {
  id: "12345678-1234-4234-8234-123456789012",
  businessId: "12345678-1234-4234-8234-123456789012",
  version: 3,
  status: "approved",
  payload: {},
  media: [],
  events: [],
  publication: { published: true, slug: "listing", revision: 2 },
};
const session = { staff: false, getToken: async () => "owner-token" };
beforeEach(() => vi.clearAllMocks());
describe("owner listing actions", () => {
  it("requires explicit confirmation and updates from the server response", async () => {
    const updated = {
      ...application,
      version: 4,
      publication: { ...application.publication!, published: false },
    };
    request.mockResolvedValue({ application: updated });
    const changed = vi.fn();
    render(
      <OwnerListingActions
        application={application}
        session={session}
        product="mobility"
        editPath="/list"
        onChanged={changed}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delist" }));
    expect(request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(request).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Delist" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delist" }));
    await waitFor(() => expect(changed).toHaveBeenCalledWith(updated));
    expect(request).toHaveBeenCalledWith(
      `/mobility/applications/${application.id}/delist`,
      expect.anything(),
      "owner-token",
      "POST",
      { expectedVersion: 3 },
    );
  });
  it("keeps the listing and confirmation on a failed or stale request", async () => {
    request.mockRejectedValue(new Error("The listing changed."));
    const changed = vi.fn();
    render(
      <OwnerListingActions
        application={application}
        session={session}
        product="mobility"
        editPath="/list"
        onChanged={changed}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delist" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm delist" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The listing changed",
    );
    expect(changed).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Confirm delist" }),
    ).toBeEnabled();
  });
  it("shows saved drafts and does not offer to delist an unpublished record", () => {
    render(
      <OwnerListingActions
        application={{ ...application, status: "draft", publication: null }}
        session={session}
        product="mobility"
        editPath="/list?application=owned"
        onChanged={vi.fn()}
      />,
    );
    expect(screen.getByRole("link", { name: "Resume draft" })).toHaveAttribute(
      "href",
      "/list?application=owned",
    );
    expect(
      screen.queryByRole("button", { name: "Delist" }),
    ).not.toBeInTheDocument();
  });
});
