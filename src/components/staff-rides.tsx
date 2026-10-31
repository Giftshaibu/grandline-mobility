import { useEffect, useState } from "react";
import { AuthSession, type Session } from "./auth-session";
import { liveRides } from "../lib/config";
import { businessRequest } from "../lib/business-api";
import { ridePage, rideResponse, malawiTime, type Ride } from "../lib/ride-api";
import { StaffRideAssignment } from "./staff-ride-assignment";
export function StaffRides() {
  return (
    <section className="wrap section">
      <h1>Ride coordination</h1>
      <p>
        Staff confirms availability, quotes fares and assigns approved drivers
        and vehicles. Trip payments stay offline.
      </p>
      <p>
        <a href="/staff">Application and operator review</a>
      </p>
      {liveRides ? (
        <AuthSession>
          {(session) =>
            session.staff ? (
              <Operations session={session} />
            ) : (
              <p>Active organization admin access is required.</p>
            )
          }
        </AuthSession>
      ) : (
        <p>Ride operations are not enabled on this deployment.</p>
      )}
    </section>
  );
}
function Operations({ session }: { session: Session }) {
  const [items, setItems] = useState<Ride[]>([]),
    [cursor, setCursor] = useState<string | null>(null),
    [selected, setSelected] = useState<Ride | null>(null);
  const [status, setStatus] = useState("requested"),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false);
  const [reason, setReason] = useState("");
  async function token() {
    const value = await session.getToken();
    if (!value) throw new Error("Sign in again.");
    return value;
  }
  async function load(next?: string) {
    setBusy(true);
    setMessage("");
    try {
      const page = await businessRequest(
        `/staff/rides?status=${status}${next ? `&cursor=${next}` : ""}`,
        ridePage,
        await token(),
      );
      setItems((current) => (next ? [...current, ...page.items] : page.items));
      setCursor(page.nextCursor);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Queue unavailable.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    setReady(true);
    void load();
  }, [status]);
  async function act(action: string, body: Record<string, unknown>) {
    if (!selected || !reason.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await businessRequest(
        `/staff/rides/${selected.id}/${action}`,
        rideResponse,
        await token(),
        "POST",
        { ...body, expectedVersion: selected.version, reason },
      );
      setSelected(result.ride);
      setMessage("Saved. The current request state is shown below.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Action not confirmed. Refresh before retrying.",
      );
    } finally {
      setBusy(false);
    }
  }
  const can = (states: string[]) =>
    !!selected && states.includes(selected.status);
  return (
    <>
      <fieldset disabled={!ready || busy}>
        <label>
          Request status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setSelected(null);
            }}
          >
            {[
              "requested",
              "availability-check",
              "quoted",
              "accepted",
              "assigned",
              "in-progress",
              "completed",
              "cancelled",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button secondary"
          onClick={() => void load()}
        >
          Refresh queue
        </button>
      </fieldset>
      <div className="ride-request-list">
        {items.map((ride) => (
          <article key={ride.id}>
            <h2>
              {ride.pickup.address} → {ride.destination.address}
            </h2>
            <p>
              {ride.kind} · {ride.status} ·{" "}
              {ride.scheduledAt
                ? malawiTime(ride.scheduledAt)
                : "Now requested"}
            </p>
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setSelected(ride);
                setReason("");
              }}
            >
              Open request
            </button>
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
      {!busy && !message && !items.length && <p>No requests in this queue.</p>}
      {selected && (
        <section className="review-panel">
          <h2>
            {selected.kind} request · {selected.status}
          </h2>
          <p>{selected.id}</p>
          <p>
            {selected.contactName} ·{" "}
            <a href={`tel:${selected.phone}`}>{selected.phone}</a>
          </p>
          <p>
            {selected.pickup.address} ({selected.pickup.landmark}) →{" "}
            {selected.destination.address} ({selected.destination.landmark})
          </p>
          <p>
            {selected.passengers} passengers · {selected.notes}
          </p>
          {selected.quote && (
            <p>
              Current fare: MK {selected.quote.amount.toLocaleString()} ·{" "}
              {selected.quote.acceptedAt
                ? "Accepted"
                : `Accept by ${malawiTime(selected.quote.expiresAt)}`}
            </p>
          )}
          <button
            type="button"
            className="text-action"
            disabled={busy}
            onClick={() => {
              void (async () => {
                try {
                  setSelected(
                    (
                      await businessRequest(
                        `/staff/rides/${selected.id}`,
                        rideResponse,
                        await token(),
                      )
                    ).ride,
                  );
                } catch (error) {
                  setMessage(String(error));
                }
              })();
            }}
          >
            Refresh selected request
          </button>
          <fieldset disabled={!ready || busy}>
            <label>
              Staff action reason
              <textarea
                value={reason}
                maxLength={500}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            {can(["requested"]) && (
              <button
                type="button"
                className="button secondary"
                disabled={!reason.trim()}
                onClick={() =>
                  void act("status", { status: "availability-check" })
                }
              >
                Begin availability check
              </button>
            )}
            {can(["requested", "availability-check", "quoted", "accepted"]) && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = new FormData(event.currentTarget);
                  void act("quote", {
                    amount: Number(form.get("amount")),
                    inclusions: form.get("inclusions"),
                  });
                }}
              >
                <h3>Manual fare quote</h3>
                <label>
                  Fare in whole MWK
                  <input
                    name="amount"
                    type="number"
                    min={1}
                    max={2147483647}
                    required
                  />
                </label>
                <label>
                  Fare inclusions
                  <textarea name="inclusions" required maxLength={2000} />
                </label>
                <p>
                  A new quote replaces the previous quote and requires customer
                  acceptance.
                </p>
                <button
                  type="submit"
                  className="button"
                  disabled={!reason.trim()}
                >
                  Issue fare quote
                </button>
              </form>
            )}
            {can(["accepted"]) && (
              <StaffRideAssignment
                key={selected.id}
                reason={reason}
                token={token}
                act={act}
                setMessage={setMessage}
              />
            )}
            {can(["assigned"]) && (
              <button
                type="button"
                className="button"
                disabled={!reason.trim()}
                onClick={() => void act("status", { status: "in-progress" })}
              >
                Record trip started
              </button>
            )}
            {can(["in-progress"]) && (
              <button
                type="button"
                className="button"
                disabled={!reason.trim()}
                onClick={() => void act("status", { status: "completed" })}
              >
                Record trip completed
              </button>
            )}
            {can([
              "requested",
              "availability-check",
              "quoted",
              "accepted",
              "assigned",
              "in-progress",
            ]) && (
              <button
                type="button"
                className="button secondary"
                disabled={!reason.trim()}
                onClick={() => void act("status", { status: "cancelled" })}
              >
                Record cancellation
              </button>
            )}
          </fieldset>
        </section>
      )}
      {message && <p role="status">{message}</p>}
    </>
  );
}
