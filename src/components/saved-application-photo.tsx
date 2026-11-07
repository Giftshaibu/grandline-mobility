import { ZoomableImage } from "@grandline/ui/images";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@grandline/ui";
import { businessRequest } from "../lib/business-api";
import type { Session } from "./auth-session";

export function SavedApplicationPhoto({ product, applicationId, mediaId, filename, session }: {
  product: "services" | "mobility"; applicationId: string; mediaId: string; filename: string; session: Session;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function preview() {
    setBusy(true); setError("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again to preview this photo.");
      const result = await businessRequest(`/${product}/applications/${applicationId}/media/${mediaId}/read`, z.object({ url: z.string().url(), expiresAt: z.string() }), token);
      const target = new URL(result.url);
      if (target.protocol !== "https:" || target.username || target.password) throw new Error("The photo preview is unavailable.");
      if (active.current) setUrl(result.url);
    } catch {
      if (active.current) setError("Saved photo could not load. Try again or sign in again.");
    } finally { if (active.current) setBusy(false); }
  }
  return <div className="grandline-saved-photo">
    {url && <ZoomableImage src={url} alt={`Saved photo: ${filename}`} referrerPolicy="no-referrer" onError={() => { setUrl(null); setError("The photo preview expired or could not load. Try again."); }} />}
    {!url && <Button variant="text" disabled={busy} onClick={() => void preview()}>{busy ? "Loading saved photo…" : `Preview saved photo: ${filename}`}</Button>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
