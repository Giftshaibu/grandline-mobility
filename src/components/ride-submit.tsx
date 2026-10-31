import { useRef, useState, useEffect } from "react";
import { z } from "zod";
import { AuthSession, type Session } from "./auth-session";
import { liveRides } from "../lib/config";
import { businessRequest } from "../lib/business-api";
import { rideRequest, type Ride } from "../lib/ride-api";
import { ridePayload, type RideDraft } from "../lib/ride-draft";
export function RideSubmit(props: {
  draft: RideDraft;
  editing: Ride | null;
  saved: (ride: Ride) => void;
}) {
  if (!liveRides)
    return (
      <section className="submission-unavailable">
        <h3>Submission unavailable</h3>
        <p>
          Ride requests are not enabled on this deployment. Your route stays on
          this page.
        </p>
        <button type="button" className="button" disabled>
          Submission unavailable
        </button>
      </section>
    );
  return (
    <AuthSession>
      {(session) => <Submit {...props} session={session} />}
    </AuthSession>
  );
}
function Submit({
  draft,
  editing,
  saved,
  session,
}: {
  draft: RideDraft;
  editing: Ride | null;
  saved: (ride: Ride) => void;
  session: Session;
}) {
  const [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const errorNode = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (error) errorNode.current?.focus();
  }, [error]);
  const pending = useRef<{ fingerprint: string; key: string } | null>(null);
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    setReady(true);
    return () => {
      active.current = false;
    };
  }, []);
  async function send() {
    setError("");
    setBusy(true);
    try {
      const journey = ridePayload(draft);
      const fingerprint = JSON.stringify(journey);
      if (pending.current?.fingerprint !== fingerprint)
        pending.current = { fingerprint, key: crypto.randomUUID() };
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again before sending your request.");
      await businessRequest("/users/me", z.unknown(), token, "PUT");
      const result = editing
        ? await rideRequest(`/${editing.id}`, token, "PATCH", {
            expectedVersion: editing.version,
            journey,
          })
        : await rideRequest("", token, "POST", {
            requestKey: pending.current.key,
            journey,
          });
      if (active.current) saved(result);
    } catch (value) {
      setError(
        value instanceof z.ZodError
          ? "Check your route, passenger count and contact details."
          : value instanceof Error
            ? value.message
            : "The request could not be confirmed. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <button
        type="button"
        className="button"
        disabled={!ready || busy || !draft.confirmed}
        onClick={() => void send()}
      >
        {busy
          ? "Saving request…"
          : editing
            ? "Save journey changes"
            : "Request a manual quote"}
      </button>
      {editing && (
        <p>
          Changing your journey invalidates the previous fare and acceptance.
        </p>
      )}
      {error && (
        <p ref={errorNode} tabIndex={-1} role="alert">
          {error}
        </p>
      )}
    </>
  );
}
