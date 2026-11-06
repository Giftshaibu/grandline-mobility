import { ListingProgress, Button, Field } from "@grandline/ui";
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
      <ListingProgress steps={["Journey", "Ride & time", "Review"]} current={step} onSelect={index => { setStep(index); setErrors({}); }} />
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
                <Field id={`ride-${field}`} label={<>{field === "pickup" ? "Pickup location" : "Destination"}</>} error={errors[field]}>
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
</Field>
                <Field id={`ride-${field}-landmark`} label={<>{field === "pickup"
                    ? "Pickup landmark (optional)"
                    : "Destination landmark (optional)"}</>} error={undefined}>
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
</Field>
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
            <Field id={"ride-passengers"} label={<>Passengers</>} error={errors["passengers"]}>
<input
                name="passengers"
                inputMode="numeric"
                value={draft.passengers}
                aria-invalid={!!errors["passengers"]}
                onChange={(event) => update("passengers", event.target.value)}
              />
</Field>
            <Field id={"ride-field-4"} label={<>Pickup timing</>} error={undefined}>
<select
                value={draft.timing}
                onChange={(event) =>
                  update("timing", event.target.value as RideDraft["timing"])
                }
              >
                <option value="now">Now — subject to staff confirmation</option>
                <option value="scheduled">Schedule a pickup</option>
              </select>
</Field>
            {draft.timing === "scheduled" && (
              <>
                <Field id={"ride-scheduled"} label={<>Pickup date and time (Malawi, UTC+02:00)</>} error={errors["scheduled"]}>
<input
                    name="scheduled"
                    type="datetime-local"
                    value={draft.scheduled}
                    aria-invalid={!!errors["scheduled"]}
                    onChange={(event) =>
                      update("scheduled", event.target.value)
                    }
                  />
</Field>
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
            <Field id={"ride-contactName"} label={<>Contact name</>} error={errors["contactName"]}>
<input
                name="contactName"
                autoComplete="name"
                maxLength={120}
                value={draft.contactName}
                onChange={(event) => update("contactName", event.target.value)}
              />
</Field>
            <Field id={"ride-phone"} label={<>Contact phone</>} error={errors["phone"]}>
<input
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
                value={draft.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
</Field>
            <Field id={"ride-field-8"} label={<>Notes and passenger requirements (optional)</>} error={undefined}>
<textarea
                maxLength={2000}
                value={draft.notes}
                onChange={(event) => update("notes", event.target.value)}
              />
</Field>
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
        <Button
          type="button"
          variant="secondary"
          disabled={!ready || step === 0}
          onClick={() => {
            setStep(step - 1);
            setErrors({});
          }}
        >
          Back
        </Button>
        {step < 2 && (
          <Button type="submit" disabled={!ready}>
            Continue
          </Button>
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
