import { Field } from "@grandline/ui";
import {
  createContext,
  useContext,
  type ReactElement,
} from "react";
export type ApplicationErrors = Record<string, string>;
export const ApplicationValidation = createContext<{
  errors: ApplicationErrors;
  clear: (name: string) => void;
}>({ errors: {}, clear: () => {} });
export function ApplicationField({ name, label, hint, children }: {
  name: string; label: string; hint?: string; children: ReactElement;
}) {
  const { errors, clear } = useContext(ApplicationValidation);
  return <Field id={`application-${name}`} label={label} hint={hint} error={errors[name]} onChange={() => clear(name)}>{children}</Field>;
}
export { ReviewSection, ReviewFacts } from "@grandline/ui";
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
        for your listing. Multiple rates are not added together here.
      </p>
      <p>
        Payment references and verification are managed in My businesses. Advertised service or hire
        prices are separate from listing fees.
      </p>
    </aside>
  );
}
