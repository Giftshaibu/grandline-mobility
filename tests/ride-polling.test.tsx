import { renderHook, act } from "@testing-library/react";
import { it, expect, vi, afterEach } from "vitest";
vi.mock("../src/lib/ride-api", () => ({ rideRequest: vi.fn() }));
import { rideRequest, type Ride } from "../src/lib/ride-api";
import { useRidePolling } from "../src/lib/use-ride-polling";
const session = { staff: false, getToken: async () => "token" };
const record = {
  id: "12345678-1234-4234-8234-123456789012",
  status: "requested",
} as Ride;
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it("pauses hidden-page updates and resumes with a fresh visible-page request", async () => {
  vi.useFakeTimers();
  const visibility = vi
    .spyOn(document, "visibilityState", "get")
    .mockReturnValue("visible");
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  vi.mocked(rideRequest).mockReset().mockResolvedValue(record);
  const hook = renderHook(() => useRidePolling(record.id, session));
  await act(async () => {});
  expect(rideRequest).toHaveBeenCalledTimes(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15000);
  });
  expect(rideRequest).toHaveBeenCalledTimes(2);
  visibility.mockReturnValue("hidden");
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  await act(async () => {
    await vi.advanceTimersByTimeAsync(120000);
  });
  expect(rideRequest).toHaveBeenCalledTimes(2);
  visibility.mockReturnValue("visible");
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  expect(rideRequest).toHaveBeenCalledTimes(3);
  hook.unmount();
});
it("backs off failures and exposes stale/offline status without inventing progress", async () => {
  vi.useFakeTimers();
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  const online = vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  vi.mocked(rideRequest)
    .mockReset()
    .mockRejectedValueOnce(new Error("Connection lost"))
    .mockResolvedValue(record);
  const hook = renderHook(() => useRidePolling(record.id, session));
  await act(async () => {});
  expect(hook.result.current.ride).toBeNull();
  expect(hook.result.current.error).toContain("Connection lost");
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15000);
  });
  expect(rideRequest).toHaveBeenCalledTimes(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(15000);
  });
  expect(rideRequest).toHaveBeenCalledTimes(2);
  online.mockReturnValue(false);
  await act(async () => window.dispatchEvent(new Event("offline")));
  expect(hook.result.current.error).toContain("offline");
  expect(hook.result.current.ride?.status).toBe("requested");
  hook.unmount();
});
