import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import {
  NotificationInbox,
  NotificationOperations,
} from "../src/components/notification-center";
const mocks = vi.hoisted(() => ({ request: vi.fn() }));
vi.mock("../src/lib/business-api", () => ({ businessRequest: mocks.request }));
const session = { staff: true, getToken: async () => "private-token" };
beforeEach(() => mocks.request.mockReset());
it("shows private notifications and marks them read only after a successful request", async () => {
  mocks.request
    .mockResolvedValueOnce({
      notifications: [
        {
          id: "n",
          title: "Application approved",
          body: "Open the current record.",
          href: "https://services.grandlineautomw.com/my-businesses",
          readAt: null,
        },
      ],
      unreadCount: 1,
    })
    .mockResolvedValueOnce({ updatedCount: 1 })
    .mockResolvedValueOnce({ notifications: [], unreadCount: 0 });
  render(<NotificationInbox session={session} />);
  expect(
    await screen.findByRole("link", { name: "Application approved" }),
  ).toHaveAttribute(
    "href",
    "https://services.grandlineautomw.com/my-businesses",
  );
  fireEvent.click(screen.getByRole("button", { name: "Mark all read" }));
  await screen.findByText("No notifications yet.");
  expect(mocks.request.mock.calls[1]?.[0]).toBe("/me/notifications/read-all");
});
it("shows an error rather than claiming empty or successful inbox data", async () => {
  mocks.request.mockRejectedValueOnce(new Error("Unavailable"));
  render(<NotificationInbox session={session} />);
  expect(await screen.findByRole("alert")).toHaveTextContent("could not load");
  expect(screen.queryByText("No notifications yet.")).not.toBeInTheDocument();
});
it("requires an audit reason and distinguishes a queued retry from delivery", async () => {
  mocks.request
    .mockResolvedValueOnce({
      counts: { dead: 1 },
      failures: [
        {
          id: "failed",
          template: "ecosystem_update",
          attempts: 5,
          lastErrorCode: "PROVIDER_REQUEST_FAILED",
        },
      ],
      pendingSources: { applications: 0 },
    })
    .mockResolvedValueOnce({ queued: true });
  render(<NotificationOperations session={session} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Refresh delivery status" }),
  );
  const retry = await screen.findByRole("button", { name: "Queue retry" });
  expect(retry).toBeDisabled();
  fireEvent.change(screen.getByLabelText("Reason for retry"), {
    target: { value: "Provider recovered" },
  });
  fireEvent.click(retry);
  await waitFor(() =>
    expect(screen.getByRole("status")).toHaveTextContent(
      "Delivery has not been confirmed",
    ),
  );
  expect(mocks.request.mock.calls[1]?.[4]).toEqual({
    reason: "Provider recovered",
  });
});
