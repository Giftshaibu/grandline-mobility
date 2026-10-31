import { useId, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { directory } from "../lib/directory";
import { enquirySchema } from "../lib/contracts";
import { businessRequest } from "../lib/business-api";
import { AuthSession, type Session } from "./auth-session";
export function Enquiry({ listingId }: { listingId?: string | undefined }) {
  const note = useId();
  if (directory.supported && listingId)
    return (
      <AuthSession>
        {(session) => <LiveEnquiry listingId={listingId} session={session} />}
      </AuthSession>
    );
  return (
    <section className="enquiry-panel" aria-labelledby={`${note}-title`}>
      <h2 id={`${note}-title`}>Send an enquiry</h2>
      <p id={note}>
        Enquiries are unavailable for this preview. Nothing entered here is sent
        or saved.
      </p>
      <form onSubmit={(event) => event.preventDefault()}>
        <fieldset disabled aria-describedby={note}>
          <label>
            Your name
            <input autoComplete="name" name="name" />
          </label>
          <label>
            Email address
            <input type="email" autoComplete="email" name="email" />
          </label>
          <label>
            How can the provider help?
            <textarea name="message" rows={4} />
          </label>
          <button className="button" type="submit">
            Enquiries unavailable
          </button>
        </fieldset>
      </form>
    </section>
  );
}
function LiveEnquiry({
  listingId,
  session,
}: {
  listingId: string;
  session: Session;
}) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const key = useRef<string | null>(null);
  const root = useRef<HTMLFormElement>(null);
  useEffect(() => setReady(true), []);
  async function submit() {
    const parsed = enquirySchema.safeParse({ ...form, listingId });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your enquiry.");
      root.current
        ?.querySelector<HTMLInputElement>(
          `[name="${parsed.error.issues[0]?.path[0]}"]`,
        )
        ?.focus();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Your session expired. Sign in again.");
      await businessRequest("/users/me", z.unknown(), token, "PUT");
      key.current ??= crypto.randomUUID();
      const result = await directory.enquire(
        { ...parsed.data, requestKey: key.current },
        token,
      );
      if (result.state !== "ready")
        throw new Error(
          "Your enquiry could not be confirmed. Please retry; no success has been assumed.",
        );
      setReceipt(result.data.id);
    } catch (value) {
      setError(value instanceof Error ? value.message : "The enquiry failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="enquiry-panel">
      <h2>Send a transport enquiry</h2>
      <p>Your contact details are shared privately for this enquiry.</p>
      {receipt ? (
        <p role="status">Enquiry received. Reference: {receipt}</p>
      ) : (
        <form
          ref={root}
          onSubmit={(event) => {
            event.preventDefault();
            if (ready && !busy) void submit();
          }}
        >
          <fieldset disabled={!ready || busy}>
            {(["name", "email", "message"] as const).map((name) => (
              <label key={name}>
                {name === "name"
                  ? "Your name"
                  : name === "email"
                    ? "Email address"
                    : "How can the provider help?"}
                {name === "message" ? (
                  <textarea
                    name={name}
                    value={form[name]}
                    rows={4}
                    maxLength={2000}
                    onChange={(event) => {
                      setForm({ ...form, [name]: event.target.value });
                      key.current = null;
                    }}
                  />
                ) : (
                  <input
                    name={name}
                    type={name === "email" ? "email" : "text"}
                    value={form[name]}
                    maxLength={name === "name" ? 120 : 254}
                    onChange={(event) => {
                      setForm({ ...form, [name]: event.target.value });
                      key.current = null;
                    }}
                  />
                )}
              </label>
            ))}
            <button className="button" type="submit">
              {busy ? "Sending enquiry…" : "Send enquiry"}
            </button>
          </fieldset>
          {error && <p role="alert">{error}</p>}
        </form>
      )}
    </section>
  );
}
