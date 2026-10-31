import { useState } from "react";
import { AuthSession, type Session } from "./auth-session";
import { useRidePolling } from "../lib/use-ride-polling";
import { rideRequest, malawiTime, type Ride } from "../lib/ride-api";
import { liveRides } from "../lib/config";
export function RideStatus({
  id,
  edit,
}: {
  id: string;
  edit: (ride: Ride) => void;
}) {
  if (!liveRides)
    return <p>Saved ride access is not enabled on this deployment.</p>;
  return (
    <AuthSession>
      {(session) => <Status key={id} id={id} session={session} edit={edit} />}
    </AuthSession>
  );
}
export function Status({
  id,
  session,
  edit,
}: {
  id: string;
  session: Session;
  edit: (ride: Ride) => void;
}) {
  const { ride, error, updated, refresh } = useRidePolling(id, session);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  async function accept() {
    if (!ride?.quote) return;
    setBusy(true);
    setMessage("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again.");
      await rideRequest(`/${id}/accept`, token, "POST", {
        expectedVersion: ride.version,
        quoteId: ride.quote.id,
      });
      refresh();
      setMessage("Quote accepted. Staff will confirm an assignment.");
    } catch (value) {
      setMessage(
        value instanceof Error
          ? value.message
          : "Acceptance was not confirmed. Refresh before retrying.",
      );
      refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="ride-status" aria-label="Your ride request">
      <div className="ride-panel-heading">
        <h1>Your ride request</h1>
        <button type="button" className="text-action" onClick={refresh}>
          Refresh status
        </button>
      </div>
      {error && (
        <p role="alert">
          {error} {updated && "The last saved status may be stale."}
        </p>
      )}
      {!ride && !error && <p role="status">Loading your private request…</p>}
      {ride && (
        <>
          <span className="status-tag">{ride.status.replaceAll("-", " ")}</span>
          <p className="muted">
            Requested {malawiTime(ride.createdAt)} · Reference {ride.id}
          </p>
          <dl className="ride-route-summary">
            <div>
              <dt>Pickup</dt>
              <dd>
                {ride.pickup.address}
                {ride.pickup.landmark && ` · ${ride.pickup.landmark}`}
              </dd>
            </div>
            <div>
              <dt>Destination</dt>
              <dd>
                {ride.destination.address}
                {ride.destination.landmark && ` · ${ride.destination.landmark}`}
              </dd>
            </div>
          </dl>
          <p>
            {ride.kind === "bike" ? "Bike" : "Taxi"} · {ride.passengers}{" "}
            passenger{ride.passengers === 1 ? "" : "s"} ·{" "}
            {ride.scheduledAt
              ? `${malawiTime(ride.scheduledAt)} (Malawi time)`
              : "Immediate pickup requested"}
          </p>
          {["requested", "availability-check"].includes(ride.status) && (
            <p>
              Staff will check availability and provide a fare. No driver or
              pickup time is confirmed yet.
            </p>
          )}
          {ride.quote && (
            <section className="ride-quote">
              <h2>Staff fare quote</h2>
              <p className="ride-fare">
                MK {ride.quote.amount.toLocaleString("en-MW")}
              </p>
              <p>{ride.quote.inclusions}</p>
              <p>
                Accept by {malawiTime(ride.quote.expiresAt)} (Malawi time).
                Payment is arranged offline.
              </p>
              {ride.status === "quoted" &&
                (Date.parse(ride.quote.expiresAt) <= Date.now() ? (
                  <p role="status">
                    This quote has expired. Staff must provide an updated quote.
                  </p>
                ) : (
                  <button
                    type="button"
                    className="button"
                    disabled={busy || !!error}
                    onClick={() => void accept()}
                  >
                    Accept this quote
                  </button>
                ))}
              {ride.quote.acceptedAt && (
                <p>Accepted {malawiTime(ride.quote.acceptedAt)}</p>
              )}
            </section>
          )}
          {ride.assignment && (
            <section className="ride-assignment">
              <h2>Your assigned {ride.kind === "bike" ? "rider" : "driver"}</h2>
              <p>{ride.assignment.driverName}</p>
              <a href={`tel:${ride.assignment.driverPhone}`}>
                Call {ride.assignment.driverPhone}
              </a>
              <p>
                {ride.assignment.vehicleLabel} · {ride.assignment.registration}
              </p>
              <p>
                Staff records trip progress here. Live location tracking is not
                provided.
              </p>
            </section>
          )}
          {ride.status === "accepted" && (
            <p>
              Your fare is accepted. Assignment is still awaiting staff
              confirmation.
            </p>
          )}
          {["requested", "availability-check", "quoted", "accepted"].includes(
            ride.status,
          ) && (
            <button
              type="button"
              className="button secondary"
              disabled={!!error}
              onClick={() => edit(ride)}
            >
              Change journey
            </button>
          )}
          <details>
            <summary>Recorded progress</summary>
            <ol>
              {[...ride.events].reverse().map((event, index) => (
                <li key={index}>
                  {event.action.replaceAll("_", " ")} ·{" "}
                  {malawiTime(event.createdAt)}
                </li>
              ))}
            </ol>
          </details>
          {updated && (
            <p className="muted">
              Last checked {malawiTime(updated)}. Updates pause when this page
              is hidden.
            </p>
          )}
        </>
      )}
      {message && <p role="status">{message}</p>}
    </section>
  );
}
