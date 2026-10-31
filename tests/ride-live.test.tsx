import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
vi.mock("../src/lib/config", () => ({
  liveRides: true,
  apiBaseUrl: "https://api.example.test",
}));
vi.mock("../src/components/auth-session", () => ({
  AuthSession: ({ children }: { children: (session: unknown) => unknown }) =>
    children({ staff: false, getToken: async () => "private-token" }),
}));
vi.mock("../src/lib/business-api", async (original) => ({
  ...(await original<typeof import("../src/lib/business-api")>()),
  businessRequest: vi.fn(),
}));
const polling = vi.hoisted(() => ({
  value: null as unknown,
  refresh: vi.fn(),
  error: "",
}));
vi.mock("../src/lib/use-ride-polling", () => ({
  useRidePolling: () => ({
    ride: polling.value,
    error: polling.error,
    updated: "",
    refresh: polling.refresh,
  }),
}));
import { businessRequest } from "../src/lib/business-api";
import { RideSubmit } from "../src/components/ride-submit";
import { Status } from "../src/components/ride-status";
import { emptyRide } from "../src/lib/ride-draft";
const id = "12345678-1234-4234-8234-123456789012";
const record = {
  id,
  version: 3,
  kind: "taxi",
  timing: "now",
  scheduledAt: null,
  pickup: { address: "Market", landmark: "" },
  destination: { address: "University", landmark: "" },
  passengers: 2,
  contactName: "Customer",
  phone: "+265999000000",
  notes: "",
  status: "quoted",
  createdAt: "2030-01-01T10:00:00Z",
  updatedAt: "2030-01-01T10:00:00Z",
  quote: {
    id,
    revision: 1,
    amount: 5000,
    currency: "MWK",
    inclusions: "Trip only",
    expiresAt: "2099-01-01T12:00:00Z",
    acceptedAt: null,
  },
  assignment: null,
  events: [],
};
beforeEach(() => {
  vi.mocked(businessRequest).mockReset();
  polling.value = record;
  polling.error = "";
  polling.refresh.mockReset();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockImplementation(
        async () => new Response(JSON.stringify({ rides: true })),
      ),
  );
});
it("only confirms a saved ride acknowledgement and preserves the request key after provider failure", async () => {
  const saved = vi.fn();
  let failed = true;
  vi.mocked(businessRequest).mockImplementation(async (path) => {
    if (path === "/users/me") return {};
    if (failed) throw new Error("Network failure, retry safely");
    return { ride: record };
  });
  const draft = {
    ...emptyRide("taxi"),
    pickup: {
      address: "Market",
      landmark: "",
      lat: null,
      lng: null,
      placeId: "",
    },
    destination: {
      address: "University",
      landmark: "",
      lat: null,
      lng: null,
      placeId: "",
    },
    contactName: "Customer",
    phone: "+265999000000",
    confirmed: true,
  };
  render(<RideSubmit draft={draft} editing={null} saved={saved} />);
  fireEvent.click(await screen.findByText("Request a manual quote"));
  await screen.findByText("Network failure, retry safely");
  expect(saved).not.toHaveBeenCalled();
  const first = vi
    .mocked(businessRequest)
    .mock.calls.find((call) => call[0] === "/rides")![4] as {
    requestKey: string;
  };
  failed = false;
  fireEvent.click(screen.getByText("Request a manual quote"));
  await waitFor(() => expect(saved).toHaveBeenCalledWith(record));
  const creates = vi
    .mocked(businessRequest)
    .mock.calls.filter((call) => call[0] === "/rides");
  expect((creates[1]![4] as { requestKey: string }).requestKey).toBe(
    first.requestKey,
  );
});
it("accepts only the displayed versioned quote and never simulates assignment", async () => {
  vi.mocked(businessRequest).mockResolvedValue({
    ride: { ...record, status: "accepted" },
  });
  render(
    <Status
      id={id}
      session={{ staff: false, getToken: async () => "token" }}
      edit={vi.fn()}
    />,
  );
  expect(screen.queryByText(/assigned driver/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByText("Accept this quote"));
  await waitFor(() =>
    expect(businessRequest).toHaveBeenCalledWith(
      `/rides/${id}/accept`,
      expect.anything(),
      "token",
      "POST",
      { expectedVersion: 3, quoteId: id },
    ),
  );
  expect(polling.refresh).toHaveBeenCalled();
});
it("disables expired quotes and stale offline acceptance", () => {
  polling.value = {
    ...record,
    quote: { ...record.quote, expiresAt: "2000-01-01T00:00:00Z" },
  };
  const mounted = render(
    <Status
      id={id}
      session={{ staff: false, getToken: async () => "token" }}
      edit={vi.fn()}
    />,
  );
  expect(screen.getByText(/quote has expired/)).toBeVisible();
  expect(screen.queryByText("Accept this quote")).not.toBeInTheDocument();
  mounted.unmount();
  polling.value = record;
  polling.error = "Offline; last status may be stale.";
  render(
    <Status
      id={id}
      session={{ staff: false, getToken: async () => "token" }}
      edit={vi.fn()}
    />,
  );
  expect(screen.getByText("Accept this quote")).toBeDisabled();
});

afterEach(() => vi.unstubAllGlobals());
