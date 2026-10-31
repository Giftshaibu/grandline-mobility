import { useEffect, useState } from "react";
import { rideRequest, type Ride } from "./ride-api";
import type { Session } from "../components/auth-session";
export function useRidePolling(id: string, session: Session) {
  const [ride, setRide] = useState<Ride | null>(null);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let disposed = false,
      busy = false,
      failures = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      clearTimeout(timer);
      if (disposed || busy || document.visibilityState === "hidden") return;
      if (!navigator.onLine) {
        setError("You are offline. Showing the last saved status.");
        return;
      }
      busy = true;
      try {
        const token = await session.getToken();
        if (!token) throw new Error("Sign in again to refresh this request.");
        const result = await rideRequest(`/${id}`, token);
        if (disposed) return;
        setRide(result);
        setError("");
        setUpdated(new Date().toISOString());
        failures = 0;
        if (["completed", "cancelled"].includes(result.status)) return;
      } catch (value) {
        if (!disposed) {
          failures++;
          setError(
            value instanceof Error
              ? value.message
              : "Status unavailable. Previous data may be stale.",
          );
        }
      } finally {
        busy = false;
      }
      if (!disposed)
        timer = setTimeout(
          () => void poll(),
          Math.min(120000, 15000 * 2 ** Math.min(failures, 3)),
        );
    }
    const changed = () => {
      if (document.visibilityState !== "hidden") void poll();
      else clearTimeout(timer);
    };
    void poll();
    document.addEventListener("visibilitychange", changed);
    window.addEventListener("online", changed);
    window.addEventListener("offline", changed);
    return () => {
      disposed = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", changed);
      window.removeEventListener("online", changed);
      window.removeEventListener("offline", changed);
    };
  }, [id, refresh]);
  return {
    ride,
    error,
    updated,
    refresh: () => setRefresh((value) => value + 1),
  };
}
