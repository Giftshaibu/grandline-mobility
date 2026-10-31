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
    setSelected,
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
      className="submission-unavailable"
      aria-label="Save and submit application"
    >
      <h3>Your business application</h3>
      <p>
        Only an explicit save uploads these details and photos. Saving creates a
        private draft; submission requests staff review. Choosing an existing
        business and saving adds Mobility participation if needed.
      </p>
      <p>
        <a href="/my-businesses">My businesses and payment status</a>
      </p>
      <fieldset disabled={!ready || busy}>
        <label>
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
        <button
          type="button"
          className="button secondary"
          onClick={() => void execute(load)}
        >
          Load my businesses
        </button>
        <label>
          Saved application ID
          <input
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            placeholder="Copy the ID from My businesses"
          />
        </label>
        <button
          type="button"
          className="button secondary"
          onClick={() => void execute(resume)}
        >
          Resume saved application
        </button>
        <label>
          <input
            type="checkbox"
            checked={publishPhone}
            disabled={!editable}
            onChange={(event) => setPublishPhone(event.target.checked)}
          />
          Allow staff to publish this contact phone on the approved profile
        </label>
        {application && (
          <>
            <p>
              Status: <strong>{application.status.replaceAll("_", " ")}</strong>{" "}
              · Revision {application.version}
            </p>
            <p>Application ID: {application.id}</p>
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
                <span>
                  {item.originalFilename} · {item.status}
                </span>{" "}
                <button
                  type="button"
                  disabled={!editable}
                  onClick={() =>
                    void execute((token) => removeSavedPhoto(token, item.id))
                  }
                >
                  Remove saved photo
                </button>
              </div>
            ))}
          </>
        )}
        <div className="application-actions">
          <button
            type="button"
            className="button secondary"
            disabled={!editable}
            onClick={() =>
              void execute(async (token) => {
                await save(token);
              })
            }
          >
            Save draft and photos
          </button>
          {review && (
            <button
              type="button"
              className="button"
              disabled={!editable}
              onClick={() => void execute(submit)}
            >
              Submit for staff review
            </button>
          )}
          {application &&
            ["approved", "rejected"].includes(application.status) && (
              <button
                type="button"
                className="button secondary"
                onClick={() => void execute(startRevision)}
              >
                Start a new revision
              </button>
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
