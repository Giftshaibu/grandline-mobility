import { AuthSession } from "./auth-session";
import { PrivateDraftBoundary } from "./private-draft-boundary";
import { useEffect, useState } from "react";
import { emptyRide, restoreRide } from "../lib/ride-draft";
import type { Ride } from "../lib/ride-api";
import { RideForm } from "./ride-form";
import { RideMap } from "./ride-map";
import { RideStatus } from "./ride-status";
export function RideJourney({
  kind,
  requestId,
  select,
}: {
  kind: "bike" | "taxi";
  requestId?: string | undefined;
  select: (id: string | undefined, kind: "bike" | "taxi") => void;
}) {
  const [draft, setDraft] = useState(() => emptyRide(kind)),
    [editing, setEditing] = useState<Ride | null>(null);
  useEffect(() => {
    const clear = () => {
      setDraft(emptyRide(kind));
      setEditing(null);
    };
    window.addEventListener("pagehide", clear);
    return () => window.removeEventListener("pagehide", clear);
  }, [kind]);
  const form = (
    <>
      <div className="ride-mobile-summary" aria-label="Journey summary">
        <span>From: {draft.pickup.address || "Choose pickup"}</span>
        <span>To: {draft.destination.address || "Choose destination"}</span>
      </div>

      <div className="ride-layout">
        <RideForm
          draft={draft}
          setDraft={setDraft}
          editing={editing}
          saved={(ride) => {
            setEditing(null);
            select(ride.id, ride.kind);
          }}
        />
        <RideMap
          pickup={draft.pickup}
          destination={draft.destination}
          onLocation={(field, location) =>
            setDraft((value) => ({
              ...value,
              [field]: location,
              confirmed: false,
            }))
          }
        />
      </div>
    </>
  );
  return (
    <section className="wrap ride-page">
      <div className="ride-page-bar">
        <a href="/">Grandline Mobility</a>
        <nav aria-label="Ride navigation">
          <a href="/my-rides">My ride requests</a>
          <button
            type="button"
            className="text-action"
            onClick={() => {
              setDraft(emptyRide(kind));
              setEditing(null);
              select(undefined, kind);
            }}
          >
            New journey / reset
          </button>
        </nav>
      </div>
      {requestId && !editing ? (
        <RideStatus
          id={requestId}
          edit={(ride) => {
            setDraft(restoreRide(ride));
            setEditing(ride);
          }}
        />
      ) : editing ? (
        <AuthSession>
          {() => (
            <PrivateDraftBoundary
              onExit={() => {
                setDraft(emptyRide(kind));
                setEditing(null);
              }}
            >
              {form}
            </PrivateDraftBoundary>
          )}
        </AuthSession>
      ) : (
        form
      )}
    </section>
  );
}
