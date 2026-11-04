import { useEffect, useState } from "react";
import { z } from "zod";
import { businessRequest } from "../lib/business-api";
import type { Session } from "./auth-session";

const href = z.string().refine((value) => {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return (
      ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
});
const inbox = z.object({
  notifications: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      body: z.string(),
      href,
      appOrigin: z.string().url().nullable().optional(),
      readAt: z.string().nullable(),
    }),
  ),
  unreadCount: z.number(),
});
const overview = z.object({
  counts: z.record(z.number()),
  failures: z.array(
    z.object({
      id: z.string().uuid(),
      template: z.string(),
      attempts: z.number(),
      lastErrorCode: z.string().nullable(),
    }),
  ),
  pendingSources: z.record(z.number()),
});

export function NotificationInbox({ session }: { session: Session }) {
  const [data, setData] = useState<z.infer<typeof inbox> | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    void session
      .getToken()
      .then((token) => businessRequest("/me/notifications", inbox, token ?? ""))
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active)
          setError("Notifications could not load. Refresh this page to retry.");
      });
    return () => {
      active = false;
    };
  }, [session]);
  async function markRead() {
    setBusy(true);
    setError("");
    try {
      const token = await session.getToken();
      await businessRequest(
        "/me/notifications/read-all",
        z.object({ updatedCount: z.number() }),
        token ?? "",
        "POST",
      );
      setData(await businessRequest("/me/notifications", inbox, token ?? ""));
    } catch {
      setError("Notifications could not be updated.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Account notifications"
      className="application-review-service"
    >
      <h2>Notifications {data ? `(${data.unreadCount} unread)` : ""}</h2>
      {error && <p role="alert">{error}</p>}
      {!data && !error && <p role="status">Loading notifications…</p>}
      {data && (
        <>
          <button
            type="button"
            disabled={busy || !data.unreadCount}
            onClick={() => void markRead()}
          >
            Mark all read
          </button>
          {!data.notifications.length && <p>No notifications yet.</p>}
          <ul>
            {data.notifications.map((item) => (
              <li key={item.id}>
                <a
                  href={
                    item.appOrigin
                      ? new URL(item.href, item.appOrigin).href
                      : item.href
                  }
                >
                  {item.title}
                </a>
                <p>{item.body}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function NotificationOperations({ session }: { session: Session }) {
  const [data, setData] = useState<z.infer<typeof overview> | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    setBusy(true);
    try {
      setData(
        await businessRequest(
          "/staff/notifications/overview",
          overview,
          (await session.getToken()) ?? "",
        ),
      );
      setMessage("");
    } catch {
      setMessage("Notification delivery status could not load.");
    } finally {
      setBusy(false);
    }
  }
  async function retry(id: string) {
    setBusy(true);
    try {
      await businessRequest(
        `/staff/notifications/${id}/retry`,
        z.object({ queued: z.literal(true) }),
        (await session.getToken()) ?? "",
        "POST",
        { reason: reason.trim() },
      );
      setMessage("Retry queued. Delivery has not been confirmed.");
      setData(null);
      setReason("");
    } catch {
      setMessage("Retry failed. Check the message state and try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Notification delivery"
      className="application-review-service"
    >
      <h2>Notification delivery</h2>
      <button type="button" disabled={busy} onClick={() => void refresh()}>
        Refresh delivery status
      </button>
      {message && <p role="status">{message}</p>}
      {data && (
        <>
          <p>
            {Object.entries(data.counts)
              .map(([status, count]) => `${status}: ${count}`)
              .join(" · ") || "No email queued."}
          </p>
          <p>
            Waiting events:{" "}
            {Object.entries(data.pendingSources)
              .map(([source, count]) => `${source}: ${count}`)
              .join(" · ")}
          </p>
          {!!data.failures.length && (
            <label>
              Reason for retry
              <input
                value={reason}
                maxLength={500}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
          )}
          <ul>
            {data.failures.map((item) => (
              <li key={item.id}>
                {item.template} · {item.attempts} attempts ·{" "}
                {item.lastErrorCode ?? "Delivery failed"}{" "}
                <button
                  type="button"
                  disabled={busy || reason.trim().length < 3}
                  onClick={() => void retry(item.id)}
                >
                  Queue retry
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

const enquiryPage = z.object({
  enquiries: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      message: z.string(),
      listingName: z.string(),
      createdAt: z.string(),
    }),
  ),
  limit: z.number(),
});
export function EnquiryInbox({
  session,
  product,
  staff = false,
}: {
  session: Session;
  product: "services" | "mobility";
  staff?: boolean;
}) {
  const [data, setData] = useState<z.infer<typeof enquiryPage> | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load(direction: "received" | "sent") {
    setBusy(true);
    setData(null);
    setMessage("");
    try {
      setData(
        await businessRequest(
          `/${staff ? "staff" : "me"}/product-enquiries?product=${product}&direction=${direction}`,
          enquiryPage,
          (await session.getToken()) ?? "",
        ),
      );
    } catch {
      setMessage("Enquiries could not load. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      id="enquiries"
      aria-label="Customer enquiries"
      className="application-review-service"
    >
      <h2>Customer enquiries</h2>
      <button
        type="button"
        disabled={busy}
        onClick={() => void load("received")}
      >
        Load received enquiries
      </button>
      {!staff && (
        <button type="button" disabled={busy} onClick={() => void load("sent")}>
          Load sent enquiries
        </button>
      )}
      {message && <p role="alert">{message}</p>}
      {data && (
        <>
          <p>Showing the latest {data.limit} enquiries.</p>
          {!data.enquiries.length && <p>No enquiries yet.</p>}
          <ul>
            {data.enquiries.map((item) => (
              <li key={item.id}>
                <strong>{item.listingName}</strong>
                <p>{item.message}</p>
                <p>
                  {item.name} ·{" "}
                  <a href={`mailto:${encodeURIComponent(item.email)}`}>
                    {item.email}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
