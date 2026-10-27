import type { Result } from "../lib/directory";
export function Availability({
  result,
  pending = false,
  retry,
}: {
  result?: Result<unknown> | undefined;
  pending?: boolean;
  retry?: (() => void) | undefined;
}) {
  if (pending)
    return (
      <div className="availability" role="status" aria-live="polite">
        <h2>Loading the directory�</h2>
        <p>Fetching the latest information.</p>
      </div>
    );
  if (!result || result.state === "unavailable")
    return (
      <div className="availability">
        <span className="status-tag">Directory coming soon</span>
        <h2>We�re preparing this directory.</h2>
        <p>
          Provider search and enquiries aren�t available yet. You can explore
          the categories and set your search criteria.
        </p>
        <p className="muted">
          No providers or availability are being shown until the directory is
          connected.
        </p>
      </div>
    );
  if (result.state === "not-found")
    return (
      <div className="availability">
        <h2>Listing not found</h2>
        <p>This listing may have been removed.</p>
        <a href="/">Return to overview</a>
      </div>
    );
  if (result.state === "error")
    return (
      <div className="availability" role="alert">
        <h2>The directory couldn�t load.</h2>
        <p>
          {result.reason === "network"
            ? "Check your connection and try again."
            : result.reason === "invalid-response"
              ? "The directory returned incomplete information. Please try again later."
              : result.reason === "unauthorized"
                ? "Please sign in with an authorized account."
                : result.reason === "rate-limit"
                  ? "Too many requests. Please wait before trying again."
                  : "Please try again shortly."}
        </p>
        {retry && (
          <button className="button secondary" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    );
  return null;
}
