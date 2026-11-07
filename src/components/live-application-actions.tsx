import { SavedApplicationPhoto } from "./saved-application-photo";
import { Button } from "@grandline/ui";
import { AuthSession, type Session } from "./auth-session";
import type { MobilityApplication } from "../lib/mobility-application";
import { useSavedApplication } from "../lib/use-saved-application";
type Props = {
  draft: MobilityApplication;
  files: File[];
  review: boolean;
  onRestore: (draft: MobilityApplication) => void;
};
export function LiveApplicationActions(props: Props) {
  return (
    <AuthSession>
      {(session) => <ApplicationActions {...props} session={session} />}
    </AuthSession>
  );
}
function ApplicationActions({
  draft,
  files,
  review,
  onRestore,
  session,
}: Props & { session: Session }) {
  const {
    application,
    businesses,
    businessId,
    setBusinessId,
    selected,
    publishPhone,
    setPublishPhone,
    busy,
    ready,
    message,
    failed,
    feedback,
    editable,
    execute,
    load,
    resume,
    save,
    submit,
    removeSavedPhoto,
    startRevision,
  } = useSavedApplication(draft, files, onRestore, session);
  return (
    <section
      className="draft-controls"
      aria-label="Save and submit application"
    >
      <div className="draft-heading">
        {application?.status === "pending" ? (
          <div className="grandline-submission-confirmation" role="status">
            <h3>Listing submitted</h3>
            <p>
              <strong>Pending review</strong>
            </p>
            <p>
              {application.publication?.published
                ? "Your listing is published while staff review it."
                : "Your application is saved. Check My businesses for publication status and any required changes."}{" "}
              Payment has a seven-day verification period for eligible published
              listings.
            </p>
            <a href="/my-businesses">View your listing and payment status</a>
          </div>
        ) : (
          <h3>Save your progress</h3>
        )}
        <a href="/my-businesses">My businesses</a>
      </div>
      <p className="draft-help">
        Save a private draft with your photos. Submit it from Review.
      </p>
      <fieldset disabled={!ready || busy}>
        <details className="draft-settings">
          <summary>Business &amp; contact settings</summary>
          <div className="draft-business-row">
            <label className="draft-business-field">
              Business
              <select
                value={businessId}
                disabled={!!application}
                onChange={(event) => setBusinessId(event.target.value)}
              >
                <option value="">Create a new business on save</option>
                {businesses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void execute(load)}
            >
              Load my businesses
            </Button>
          </div>
          {selected && !application && (
            <Button variant="secondary" onClick={() => void execute(resume)}>
              Retry loading saved application
            </Button>
          )}
          <label className="draft-phone-consent">
            <input
              type="checkbox"
              checked={publishPhone}
              disabled={!editable}
              onChange={(event) => setPublishPhone(event.target.checked)}
            />
            Show my contact phone on the public profile
          </label>
        </details>
        {application && (
          <>
            <p>
              Status: <strong>{application.status.replaceAll("_", " ")}</strong>{" "}
              · Revision {application.version}
            </p>
            {application.events
              .filter((item) => item.reason)
              .slice(0, 3)
              .map((event, index) => (
                <p key={index}>
                  {event.action}: {event.reason}
                </p>
              ))}
            {application.media.map((item) => (
              <div key={item.id}>
                {item.status === "uploaded" && (
                  <SavedApplicationPhoto
                    product="mobility"
                    applicationId={application.id}
                    mediaId={item.id}
                    filename={item.originalFilename}
                    session={session}
                  />
                )}
                <span>
                  {item.originalFilename} · {item.status}
                </span>{" "}
                <Button
                  type="button"
                  disabled={!editable}
                  onClick={() =>
                    void execute((token) => removeSavedPhoto(token, item.id))
                  }
                >
                  Remove saved photo
                </Button>
              </div>
            ))}
          </>
        )}
        <div className="draft-actions">
          <Button
            type="button"
            variant="secondary"
            disabled={!editable}
            onClick={() =>
              void execute(async (token) => {
                await save(token);
              })
            }
          >
            Save draft and photos
          </Button>
          {review && (
            <Button
              type="button"

              disabled={!editable}
              onClick={() => void execute(submit)}
            >
              Submit for staff review
            </Button>
          )}
          {application &&
            ["approved", "rejected", "pending"].includes(
              application.status,
            ) && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => void execute(startRevision)}
              >
                Start a new revision
              </Button>
            )}
        </div>
      </fieldset>
      {busy && <p role="status">Saving your changes…</p>}
      {message && (
        <p ref={feedback} tabIndex={-1} role={failed ? "alert" : "status"}>
          {message}
        </p>
      )}
    </section>
  );
}
