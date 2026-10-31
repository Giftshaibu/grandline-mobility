import { useEffect, useRef, useState } from "react";
import { attachGoogleMap, attachPlaceSearch } from "../lib/google-maps-adapter";
import type { RideLocation } from "../lib/ride-api";
export function RideMap({
  pickup,
  destination,
  onLocation,
}: {
  pickup: RideLocation;
  destination: RideLocation;
  onLocation: (field: "pickup" | "destination", location: RideLocation) => void;
}) {
  const key = import.meta.env["VITE_GOOGLE_MAPS_BROWSER_KEY"]?.trim() ?? "";
  const node = useRef<HTMLDivElement>(null),
    pickupSearch = useRef<HTMLDivElement>(null),
    destinationSearch = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState("");
  const [target, setTarget] = useState<"pickup" | "destination">("pickup");
  const latest = useRef({ onLocation, target, pickup, destination });
  latest.current = { onLocation, target, pickup, destination };
  const handle = useRef<Awaited<ReturnType<typeof attachGoogleMap>> | null>(
    null,
  );
  useEffect(() => {
    if (!enabled || !node.current) return;
    let disposed = false;
    const cleanups: (() => void)[] = [];
    void (async () => {
      try {
        const map = await attachGoogleMap(
          node.current!,
          key,
          (point) => {
            const value = latest.current;
            value.onLocation(value.target, {
              ...value[value.target],
              ...point,
              placeId: "",
            });
          },
          (message) => {
            if (!disposed) {
              setError(message);
              setLoaded(false);
              cleanups.forEach((fn) => fn());
              handle.current?.dispose();
              handle.current = null;
            }
          },
        );
        if (disposed) {
          map.dispose();
          return;
        }
        handle.current = map;
        setLoaded(true);
        setError("");
        map.points([latest.current.pickup, latest.current.destination]);
        for (const [field, ref] of [
          ["pickup", pickupSearch],
          ["destination", destinationSearch],
        ] as const) {
          if (!ref.current) continue;
          const cleanup = await attachPlaceSearch(
            ref.current,
            key,
            `Search ${field} on Google Maps`,
            (value) => latest.current.onLocation(field, value),
            setError,
          );
          if (disposed) cleanup();
          else cleanups.push(cleanup);
        }
      } catch (value) {
        if (!disposed) {
          setError(
            value instanceof Error
              ? value.message
              : "Maps unavailable. Type your locations instead.",
          );
          setLoaded(false);
        }
      }
    })();
    return () => {
      disposed = true;
      cleanups.forEach((fn) => fn());
      handle.current?.dispose();
      handle.current = null;
    };
  }, [enabled, key]);
  useEffect(() => {
    handle.current?.points([pickup, destination]);
  }, [pickup, destination]);
  return (
    <aside className="ride-map-panel" aria-label="Journey map">
      <div className="ride-map-heading">
        <h2>Your route</h2>
        <span>Location confirmation</span>
      </div>
      {!enabled && (
        <div className="ride-map-fallback">
          <h3>Where are you heading?</h3>
          <p>
            Enter pickup and destination addresses. Add a landmark so staff can
            confirm the right place.
          </p>
          {key ? (
            <button
              type="button"
              className="button secondary"
              onClick={() => setEnabled(true)}
            >
              Open Google Maps
            </button>
          ) : (
            <p>
              Map search is not configured. You can continue with typed
              locations.
            </p>
          )}
        </div>
      )}
      <div
        ref={node}
        className={loaded ? "ride-map-canvas" : "ride-map-loading"}
      />
      {enabled && !loaded && !error && <p role="status">Loading map…</p>}
      {error && <p role="status">{error}</p>}
      {loaded && (
        <>
          <label>
            Map clicks set
            <select
              value={target}
              onChange={(event) =>
                setTarget(event.target.value as typeof target)
              }
            >
              <option value="pickup">Pickup pin</option>
              <option value="destination">Destination pin</option>
            </select>
          </label>
          <p className="muted">
            Click the map to confirm a pin, then enter or check its address.
            Pins do not calculate fares or arrival times.
          </p>
        </>
      )}
      {enabled && (
        <p className="muted">
          Google Maps is optional.{" "}
          <a
            href="https://maps.google.com/help/terms_maps/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Maps terms
          </a>{" "}
          and{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Privacy Policy
          </a>{" "}
          apply to map search.
        </p>
      )}
      <div ref={pickupSearch} />
      <div ref={destinationSearch} />
      <dl className="ride-route-summary">
        <div>
          <dt>Pickup</dt>
          <dd>{pickup.address || "Enter a pickup location"}</dd>
        </div>
        <div>
          <dt>Destination</dt>
          <dd>{destination.address || "Enter a destination"}</dd>
        </div>
      </dl>
    </aside>
  );
}
