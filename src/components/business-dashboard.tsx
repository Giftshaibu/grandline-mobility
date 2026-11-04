import { NotificationInbox, EnquiryInbox } from "./notification-center";
import { useEffect, useState } from "react";
import {
  applicationPage,
  businessRequest,
  type SavedApplication,
} from "../lib/business-api";
import { AuthSession, type Session } from "./auth-session";
import { BusinessBillingPanel } from "./business-billing-panel";
import { liveMobility } from "../lib/config";
export function BusinessDashboard() {
  return (
    <section className="wrap section">
      <h1 className="directory-title">My businesses</h1>
      <p>
        Resume saved applications, read staff feedback and review your monthly
        payment status.
      </p>
      {liveMobility ? (
        <AuthSession>
          {(session) => <><NotificationInbox session={session} /><EnquiryInbox session={session} product="mobility" /><OwnerApplications session={session} /></>}
        </AuthSession>
      ) : (
        <p>
          Saved applications and billing are not enabled on this deployment.{" "}
          <a href="/list">Explore the local application flow</a>.
        </p>
      )}
    </section>
  );
}
function OwnerApplications({ session }: { session: Session }) {
  const [applications, setApplications] = useState<SavedApplication[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function load(next?: string) {
    setBusy(true);
    setMessage("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again.");
      const page = await businessRequest(
        `/mobility/applications${next ? `?cursor=${encodeURIComponent(next)}` : ""}`,
        applicationPage,
        token,
      );
      setApplications((previous) =>
        next ? [...previous, ...page.items] : page.items,
      );
      setCursor(page.nextCursor);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Applications could not load.",
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
      <div className="application-actions">
        <a className="button" href="/list">
          Prepare a business application
        </a>
        <button
          type="button"
          className="button secondary"
          disabled={busy}
          onClick={() => void load()}
        >
          Refresh applications
        </button>
        {session.staff && <a href="/staff">Staff review workspace</a>}
      </div>
      {message && <p role="alert">{message}</p>}
      {!busy && !message && !applications.length && (
        <p>
          No saved applications yet. Explore the listing flow and explicitly
          save your first draft.
        </p>
      )}
      {applications.map((application) => (
        <article className="review-panel" key={application.id}>
          <h2>
            {typeof application.payload["name"] === "string" &&
            application.payload["name"]
              ? application.payload["name"]
              : "Untitled business"}
          </h2>
          <p>
            Status: <strong>{application.status.replaceAll("_", " ")}</strong> ·
            Revision {application.version}
          </p>
          <p>Application ID: {application.id}</p>
          {application.publication?.published && (
            <p>
              <a
                href={`/${String(application.publication.kind ?? application.payload["type"])}/${encodeURIComponent(application.publication.slug)}`}
              >
                View published profile
              </a>
            </p>
          )}
          {application.events
            .filter((event) => event.reason)
            .slice(0, 3)
            .map((event, index) => (
              <p key={index}>
                {event.action}: {event.reason}
              </p>
            ))}
          <div className="application-actions">
            <a href={`/list?application=${encodeURIComponent(application.id)}`}>
              Resume application
            </a>
            <button
              type="button"
              className="button secondary"
              onClick={() => setSelected(application.businessId)}
            >
              View billing
            </button>
          </div>
        </article>
      ))}
      {cursor && (
        <button
          type="button"
          className="button secondary"
          disabled={busy}
          onClick={() => void load(cursor)}
        >
          Load more applications
        </button>
      )}
      {busy && <p role="status">Loading your applications…</p>}
      {selected && (
        <BusinessBillingPanel
          key={selected}
          businessId={selected}
          session={session}
        />
      )}
    </>
  );
}
