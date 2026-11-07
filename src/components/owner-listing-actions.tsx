import { useState } from "react";
import { Button } from "@grandline/ui";
import {
  applicationResponse,
  businessRequest,
  type SavedApplication,
} from "../lib/business-api";
import type { Session } from "./auth-session";

export function OwnerListingActions({
  application,
  session,
  product,
  editPath,
  onChanged,
}: {
  application: SavedApplication;
  session: Session;
  product: "services" | "mobility";
  editPath: string;
  onChanged: (application: SavedApplication) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function act(action: "revise" | "delist") {
    setBusy(true);
    setError("");
    try {
      const token = await session.getToken();
      if (!token) throw new Error("Sign in again to manage your listing.");
      const result = await businessRequest(
        `/${product}/applications/${application.id}/${action}`,
        applicationResponse,
        token,
        "POST",
        { expectedVersion: application.version },
      );
      onChanged(result.application);
      setConfirm(false);
      if (action === "revise") window.location.assign(editPath);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Your listing could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <div className="application-actions">
        {["draft", "changes_requested"].includes(application.status) ? (
          <a className="button secondary" href={editPath}>
            {application.publication ? "Edit listing" : "Resume draft"}
          </a>
        ) : (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => void act("revise")}
          >
            Edit listing
          </Button>
        )}
        {application.publication?.published && (
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => setConfirm(true)}
          >
            Delist
          </Button>
        )}
      </div>
      {confirm && (
        <div
          role="group"
          aria-label="Confirm delisting"
          className="owner-delist-confirm"
        >
          <p>
            Remove this listing from public browsing? Your saved details, photos
            and payment history will remain.
          </p>
          <Button disabled={busy} onClick={() => void act("delist")}>
            {busy ? "Delisting…" : "Confirm delist"}
          </Button>{" "}
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => setConfirm(false)}
          >
            Cancel
          </Button>
        </div>
      )}
      {error && (
        <p role="alert">{error} Refresh your listings before retrying.</p>
      )}
      {application.publication && !application.publication.published && (
        <p className="muted">
          Not publicly listed. Editing does not restore public visibility.
        </p>
      )}
    </div>
  );
}
