import { flushSync } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ApplicationValidation,
  type ApplicationErrors,
} from "./application-fields";
export function ApplicationWizard({
  title,
  steps,
  validateStep,
  renderStep,
  renderReview,
  onReset,
  fees,
}: {
  title: string;
  steps: string[];
  validateStep: (step: number) => ApplicationErrors;
  renderStep: (step: number) => ReactNode;
  renderReview: (edit: (step: number) => void) => ReactNode;
  onReset: () => void;
  fees: ReactNode;
}) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<ApplicationErrors>({});
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  const root = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusRequested = useRef(false);
  const last = steps.length - 1;
  useEffect(() => setReady(true), []);
  useEffect(() => {
    const discard = () =>
      flushSync(() => {
        onReset();
        setStep(0);
        setErrors({});
        setEditing(false);
      });
    window.addEventListener("pagehide", discard);
    return () => window.removeEventListener("pagehide", discard);
  }, [onReset]);
  useEffect(() => {
    if (focusRequested.current) {
      focusRequested.current = false;
      const invalid = root.current?.querySelector<HTMLElement>(
        '[aria-invalid="true"]',
      );
      (invalid ?? heading.current)?.focus();
    }
  }, [step, errors]);
  const move = (next: number) => {
    focusRequested.current = true;
    setErrors({});
    setStep(next);
  };
  const advance = () => {
    focusRequested.current = true;
    if (editing) {
      for (let index = 0; index < last; index++) {
        const invalid = validateStep(index);
        if (Object.keys(invalid).length) {
          setErrors(invalid);
          setStep(index);
          return;
        }
      }
      setEditing(false);
      move(last);
      return;
    }
    const invalid = validateStep(step);
    setErrors(invalid);
    if (!Object.keys(invalid).length) setStep(Math.min(last, step + 1));
  };
  const edit = (next: number) => {
    setEditing(true);
    move(next);
  };
  return (
    <section className="wrap section application-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span>/</span>
        <span>Listing application</span>
      </nav>
      <div className="application-intro">
        <span className="status-tag">Business application preview</span>
        <h1 className="directory-title">{title}</h1>
        <p>
          Prepare a listing for future staff review. Nothing is submitted,
          uploaded or published. Submission will require sign-in and staff
          review when it becomes available.
        </p>
        <p className="local-preview-note">
          Drafts stay in memory only. Refreshing or leaving this page loses your
          information and selected photos.
        </p>
      </div>
      <ol className="application-steps" aria-label="Application progress">
        {steps.map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            className={index < step ? "completed" : ""}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <span>{label}</span>
          </li>
        ))}
      </ol>
      <div className="application-layout">
        <ApplicationValidation.Provider
          value={{
            errors,
            clear: (name) =>
              setErrors((previous) => {
                if (!previous[name]) return previous;
                const next = { ...previous };
                delete next[name];
                return next;
              }),
          }}
        >
          <form
            ref={root}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (ready && step < last) advance();
            }}
          >
            <div className="application-step-heading">
              <p>
                Step {step + 1} of {steps.length}
              </p>
              <h2 ref={heading} tabIndex={-1}>
                {steps[step]}
              </h2>
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="field-error" role="alert">
                Check the highlighted fields before continuing.
              </p>
            )}
            <fieldset disabled={!ready} className="application-step-fields">
              {step === last ? renderReview(edit) : renderStep(step)}
            </fieldset>
            {step === last && (
              <div className="submission-unavailable">
                <h3>Submission unavailable</h3>
                <p>
                  This application has not been sent. The listing backend, media
                  uploads and staff review are not connected yet.
                </p>
                <button className="button" type="button" disabled>
                  Submission unavailable
                </button>
              </div>
            )}
            <div className="application-actions">
              <button
                className="button secondary"
                type="button"
                disabled={!ready || step === 0}
                onClick={() => move(step - 1)}
              >
                Back
              </button>
              {step < last && (
                <button className="button" type="submit" disabled={!ready}>
                  {editing
                    ? "Save changes & return to review"
                    : step === last - 1
                      ? "Review application"
                      : "Continue"}
                </button>
              )}
              <button
                className="text-action reset-draft"
                type="button"
                disabled={!ready}
                onClick={() => {
                  onReset();
                  setEditing(false);
                  move(0);
                }}
              >
                Reset draft
              </button>
            </div>
            <noscript>
              <p>
                JavaScript is required for this local preview. Submission is
                unavailable.
              </p>
            </noscript>
          </form>
        </ApplicationValidation.Provider>
        {fees}
      </div>
    </section>
  );
}
