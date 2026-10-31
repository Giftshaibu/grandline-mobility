import { useEffect, useState } from "react";
import { AuthSession, type Session } from "./auth-session";
import { businessRequest } from "../lib/business-api";
import { liveRides } from "../lib/config";
import {
  rideCapability,
  ridePage,
  malawiTime,
  type Ride,
} from "../lib/ride-api";
export function MyRides() {
  return (
    <section className="wrap section">
      <h1>My ride requests</h1>
      <p>
        <a href="/ride">Plan a bike or taxi journey</a>
      </p>
      {liveRides ? (
        <AuthSession>{(session) => <Requests session={session} />}</AuthSession>
      ) : (
        <p>Saved ride requests are not enabled on this deployment.</p>
      )}
    </section>
  );
}
function Requests({ session }: { session: Session }) {
  const [items, setItems] = useState<Ride[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function load(next?: string) {
    setBusy(true);
    setError("");
    try {
      if (!(await rideCapability()))
        throw new Error("Ride requests are not enabled yet.");
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again.");
      const page = await businessRequest(
        `/rides${next ? `?cursor=${encodeURIComponent(next)}` : ""}`,
        ridePage,
        token,
      );
      setItems((current) => (next ? [...current, ...page.items] : page.items));
      setCursor(page.nextCursor);
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Your requests could not load.",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <>
      <button
        type="button"
        className="button secondary"
        disabled={busy}
        onClick={() => void load()}
      >
        Refresh requests
      </button>
      {error && <p role="alert">{error}</p>}
      {busy && <p role="status">Loading requests…</p>}
      {!busy && !error && !items.length && (
        <p>
          No requests yet. Prepare a journey and request a staff quote when
          ready.
        </p>
      )}
      <div className="ride-request-list">
        {items.map((ride) => (
          <article key={ride.id}>
            <span className="status-tag">
              {ride.status.replaceAll("-", " ")}
            </span>
            <h2>
              <a href={`/ride?type=${ride.kind}&request=${ride.id}`}>
                {ride.pickup.address} → {ride.destination.address}
              </a>
            </h2>
            <p>
              {ride.kind} · {malawiTime(ride.createdAt)}
            </p>
          </article>
        ))}
      </div>
      {cursor && (
        <button
          type="button"
          className="button secondary"
          disabled={busy}
          onClick={() => void load(cursor)}
        >
          Load more requests
        </button>
      )}
    </>
  );
}
