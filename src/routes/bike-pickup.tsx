import { ListingCallout } from "../components/listing-callout";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MarketplaceHero } from "../components/marketplace-hero";
import { bikeRequestSchema } from "../lib/contracts";
export const Route = createFileRoute("/bike-pickup")({ component: BikePickup });
function BikePickup() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  return (
    <>
      <div className="browse-hero">
        <MarketplaceHero
          image="bike"
          title="A bike pickup, planned around you."
          description="A staff-coordinated journey with availability and fare confirmed before a rider is assigned."
        />
      </div>
      <section className="wrap section">
        <h2>How bike pickups will work</h2>
        <ol className="flow-steps">
          {[
            "Send a request",
            "Staff checks availability",
            "Receive a manual fare quote",
            "Accept the quote",
            "Staff assigns a rider",
          ].map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="detail-layout">
          <div>
            <h2>Plan your pickup</h2>
            <p className="local-preview-note">
              Local preview only. Your details stay on this page and are not
              sent or saved. Request submission is unavailable.
            </p>
            <form
              onChange={() => setDraft(null)}
              onSubmit={(event) => {
                event.preventDefault();
                const values = Object.fromEntries(
                  new FormData(event.currentTarget),
                ) as Record<string, string>;
                const result = bikeRequestSchema.safeParse(values);
                if (!result.success) {
                  setError(
                    "Enter pickup, destination, name and a contact number of at least 7 characters.",
                  );
                  return;
                }
                setError("");
                setDraft(values);
              }}
            >
              <fieldset className="form-grid">
                <label>
                  Pickup location
                  <input
                    name="pickup"
                    required
                    maxLength={300}
                    placeholder="Landmark, road and area"
                  />
                </label>
                <label>
                  Destination
                  <input
                    name="destination"
                    required
                    maxLength={300}
                    placeholder="Where are you going?"
                  />
                </label>
                <label>
                  Your name
                  <input
                    name="name"
                    required
                    maxLength={120}
                    autoComplete="name"
                  />
                </label>
                <label>
                  Contact number
                  <input
                    name="phone"
                    type="tel"
                    required
                    minLength={7}
                    maxLength={30}
                    autoComplete="tel"
                  />
                </label>
                <label className="wide">
                  Notes
                  <textarea
                    name="notes"
                    maxLength={2000}
                    placeholder="Pickup directions or other details"
                  />
                </label>
              </fieldset>
              {error && <p role="alert">{error}</p>}
              <button
                className="button secondary"
                type="submit"
                disabled={!ready}
              >
                Review locally
              </button>
            </form>
            {draft && (
              <section
                className="review-panel"
                aria-label="Local request review"
              >
                <h2>Review your draft</h2>
                <dl>
                  {Object.entries(draft)
                    .filter(([, value]) => value)
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
                <p>
                  No request has been sent. No rider or fare has been confirmed.
                </p>
                <button className="button" disabled>
                  Requests unavailable
                </button>
              </section>
            )}
          </div>
          <aside className="enquiry-panel">
            <span className="status-tag">Not yet available</span>
            <h2>Your quote and pickup</h2>
            <p>
              A staff member will check availability and supply a fare once this
              service launches. You will accept the quote before rider
              assignment.
            </p>
            <div className="review-panel">
              <h3>Fare quote</h3>
              <p>No quote available</p>
              <button className="button secondary" disabled>
                Accept quote unavailable
              </button>
            </div>
            <p>Request status: no request submitted.</p>
            <p>Rider: not assigned.</p>
            <p className="local-preview-note">
              No automated fares, live tracking or online payment.
            </p>
          </aside>
        </div>
        <ListingCallout />
      </section>
    </>
  );
}
