import {
  cloneElement,
  createContext,
  useContext,
  type ReactElement,
  type ReactNode,
} from "react";
export type ApplicationErrors = Record<string, string>;
export const ApplicationValidation = createContext<{
  errors: ApplicationErrors;
  clear: (name: string) => void;
}>({ errors: {}, clear: () => {} });
export function ApplicationField({
  name,
  label,
  hint,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  children: ReactElement;
}) {
  const { errors, clear } = useContext(ApplicationValidation);
  const error = errors[name];
  const id = `application-${name}`;
  return (
    <div className="application-field" onChange={() => clear(name)}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children as ReactElement<Record<string, unknown>>, {
        id,
        "aria-invalid": !!error,
        "aria-describedby":
          [hint ? `${id}-hint` : "", error ? `${id}-error` : ""]
            .filter(Boolean)
            .join(" ") || undefined,
      })}
      {hint && (
        <p className="field-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
export function ReviewSection({
  title,
  step,
  edit,
  children,
}: {
  title: string;
  step: number;
  edit: (step: number) => void;
  children: ReactNode;
}) {
  return (
    <section className="application-review-section">
      <div className="review-section-heading">
        <h3>{title}</h3>
        <button
          className="text-action"
          type="button"
          onClick={() => edit(step)}
        >
          Edit {title.toLowerCase()}
        </button>
      </div>
      {children}
    </section>
  );
}
export function ReviewFacts({ items }: { items: [string, string][] }) {
  return (
    <dl className="application-facts">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || "Not supplied"}</dd>
        </div>
      ))}
    </dl>
  );
}
export function ListingFeeGuide({
  rows,
}: {
  rows: { label: string; amount: number }[];
}) {
  return (
    <aside
      className="application-fees"
      aria-label="Monthly listing fee guidance"
    >
      <span className="status-tag">Monthly listing fees</span>
      <h2>Fee guidance</h2>
      {rows.length ? (
        <dl>
          {rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>MK{row.amount.toLocaleString("en-MW")} / month</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>The monthly fee for this selection needs staff confirmation.</p>
      )}
      <p>
        Informational category rates only. Staff will confirm the applicable fee
        before publication. Multiple rates are not added together here.
      </p>
      <p>
        No payment is collected in this preview. Advertised service or hire
        prices are separate from listing fees.
      </p>
    </aside>
  );
}
