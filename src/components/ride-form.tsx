import { LocationButton } from "./ride-location-button";
import { useEffect, useRef, useState } from "react";
import { locationSchema, malawiTime, type Ride } from "../lib/ride-api";
import { malawiToUtc, type RideDraft } from "../lib/ride-draft";
import { RideSubmit } from "./ride-submit";
export function RideForm({
  draft,
  setDraft,
  editing,
  saved,
}: {
  draft: RideDraft;
  setDraft: (draft: RideDraft) => void;
  editing: Ride | null;
  saved: (ride: Ride) => void;
}) {
  const [step, setStep] = useState(0),
    [ready, setReady] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({});
  const root = useRef<HTMLFormElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    if (Object.keys(errors).length)
      root.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]')
        ?.focus();
  }, [errors]);
  const update = <K extends keyof RideDraft>(key: K, value: RideDraft[K]) => {
    setDraft({
      ...draft,
      [key]: value,
      ...(key === "confirmed" ? {} : { confirmed: false }),
    });
    setErrors({});
  };
  const advance = () => {
    const next: Record<string, string> = {};
    if (step === 0)
      for (const field of ["pickup", "destination"] as const)
        if (!locationSchema.safeParse(draft[field]).success)
          next[field] = "Enter an address of at least three characters.";
    if (
      step === 0 &&
      draft.pickup.address.trim().toLowerCase() ===
        draft.destination.address.trim().toLowerCase()
    )
      next["destination"] = "Choose a destination different from pickup.";
    if (step === 1) {
      if (
        !Number.isInteger(Number(draft.passengers)) ||
        Number(draft.passengers) < 1 ||
        Number(draft.passengers) > (draft.kind === "bike" ? 1 : 8)
      )
        next["passengers"] = "Check passenger capacity for this ride type.";
      if (draft.timing === "scheduled")
        try {
          if (Date.parse(malawiToUtc(draft.scheduled)) <= Date.now())
            throw new Error();
        } catch {
          next["scheduled"] = "Choose a future pickup in Malawi local time.";
        }
    }
    setErrors(next);
    if (!Object.keys(next).length) {
      setStep(step + 1);
      requestAnimationFrame(() => heading.current?.focus());
    }
  };
  const fieldError = (name: string) =>
    errors[name] ? (
      <p className="field-error" role="alert">
        {errors[name]}
      </p>
    ) : null;
  return (
    <form
      ref={root}
      className="ride-request-panel"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (ready && step < 2) advance();
      }}
    >
      <ol className="ride-steps" aria-label="Ride request progress">
        {["Journey", "Ride & time", "Review"].map((label, index) => (
          <li key={label} aria-current={step === index ? "step" : undefined}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <h1 ref={heading} tabIndex={-1}>
        {
          ["Where are you going?", "Choose your ride", "Review your journey"][
            step
          ]
        }
      </h1>
      <p className="muted">
        {step === 0
          ? "Add clear addresses and landmarks. Staff confirms availability and fares."
          : step === 1
            ? "Choose bike or taxi and when you would like to travel."
            : "Check your route and share the contact staff should use."}
      </p>
      <fieldset disabled={!ready}>
        {step === 0 && (
          <>
            {(["pickup", "destination"] as const).map((field) => (
              <div className="ride-location" key={field}>
                <label>
                  {field === "pickup" ? "Pickup location" : "Destination"}
                  <input
                    name={field}
                    autoComplete="off"
                    maxLength={300}
                    aria-invalid={!!errors[field]}
                    value={draft[field].address}
                    onChange={(event) =>
                      update(field, {
                        ...draft[field],
                        address: event.target.value,
                        lat: null,
                        lng: null,
                        placeId: "",
                      })
                    }
                  />
                </label>
                {fieldError(field)}
                <label>
                  {field === "pickup"
                    ? "Pickup landmark (optional)"
                    : "Destination landmark (optional)"}
                  <input
                    maxLength={300}
                    value={draft[field].landmark}
                    onChange={(event) =>
                      update(field, {
                        ...draft[field],
                        landmark: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            ))}
            <LocationButton
              onFound={(lat, lng) =>
                update("pickup", { ...draft.pickup, lat, lng, placeId: "" })
              }
            />
          </>
        )}
        {step === 1 && (
          <>
            <div className="ride-type-options">
              {(["bike", "taxi"] as const).map((kind) => (
                <label
                  key={kind}
                  className={draft.kind === kind ? "selected" : ""}
                >
                  <input
                    type="radio"
                    name="rideKind"
                    value={kind}
                    checked={draft.kind === kind}
                    onChange={() =>
                      setDraft({
                        ...draft,
                        kind,
                        passengers: kind === "bike" ? "1" : draft.passengers,
                        confirmed: false,
                      })
                    }
                  />
                  <strong>{kind === "bike" ? "Bike" : "Taxi"}</strong>
                  <span>
                    {kind === "bike"
                      ? "One passenger"
                      : "Staff confirms vehicle capacity"}
                  </span>
                </label>
              ))}
            </div>
            <label>
              Passengers
              <input
                name="passengers"
                inputMode="numeric"
                value={draft.passengers}
                aria-invalid={!!errors["passengers"]}
                onChange={(event) => update("passengers", event.target.value)}
              />
            </label>
            {fieldError("passengers")}
            <label>
              Pickup timing
              <select
                value={draft.timing}
                onChange={(event) =>
                  update("timing", event.target.value as RideDraft["timing"])
                }
              >
                <option value="now">Now — subject to staff confirmation</option>
                <option value="scheduled">Schedule a pickup</option>
              </select>
            </label>
            {draft.timing === "scheduled" && (
              <>
                <label>
                  Pickup date and time (Malawi, UTC+02:00)
                  <input
                    name="scheduled"
                    type="datetime-local"
                    value={draft.scheduled}
                    aria-invalid={!!errors["scheduled"]}
                    onChange={(event) =>
                      update("scheduled", event.target.value)
                    }
                  />
                </label>
                {fieldError("scheduled")}
              </>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <dl className="ride-route-summary">
              <div>
                <dt>Pickup</dt>
                <dd>
                  {draft.pickup.address} {draft.pickup.landmark}
                </dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>
                  {draft.destination.address} {draft.destination.landmark}
                </dd>
              </div>
            </dl>
            <p>
              {draft.kind === "bike" ? "Bike" : "Taxi"} · {draft.passengers}{" "}
              passenger(s) ·{" "}
              {draft.timing === "scheduled"
                ? `${malawiTime(malawiToUtc(draft.scheduled))} Malawi time`
                : "Immediate pickup requested"}
            </p>
            <label>
              Contact name
              <input
                name="contactName"
                autoComplete="name"
                maxLength={120}
                value={draft.contactName}
                onChange={(event) => update("contactName", event.target.value)}
              />
            </label>
            <label>
              Contact phone
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={draft.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </label>
            <label>
              Notes and passenger requirements (optional)
              <textarea
                maxLength={2000}
                value={draft.notes}
                onChange={(event) => update("notes", event.target.value)}
              />
            </label>
            <label className="ride-confirm">
              <input
                type="checkbox"
                checked={draft.confirmed}
                onChange={(event) => update("confirmed", event.target.checked)}
              />
              I have checked and confirm the pickup, destination and landmarks.
            </label>
            <p>
              Request → staff availability check → fare quote → your acceptance
              → staff assignment. No fare or driver is confirmed at submission.
            </p>
          </>
        )}
      </fieldset>
      {step === 2 && (
        <RideSubmit draft={draft} editing={editing} saved={saved} />
      )}
      <div className="ride-form-actions">
        <button
          type="button"
          className="button secondary"
          disabled={!ready || step === 0}
          onClick={() => {
            setStep(step - 1);
            setErrors({});
          }}
        >
          Back
        </button>
        {step < 2 && (
          <button type="submit" className="button" disabled={!ready}>
            Continue
          </button>
        )}
      </div>
      <noscript>
        <p>
          JavaScript is required to prepare or submit a ride request. Nothing
          has been sent.
        </p>
      </noscript>
    </form>
  );
}
