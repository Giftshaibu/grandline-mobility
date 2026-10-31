import { ApplicationField as Field } from "./application-fields";
import {
  listingTypes,
  offeringCategories,
  type MobilityApplication,
} from "../lib/mobility-application";
type Props = {
  step: number;
  draft: MobilityApplication;
  update: (field: keyof MobilityApplication, value: string) => void;
};
export function MobilityApplicationFields({ step, draft, update }: Props) {
  const input = (
    field: keyof MobilityApplication,
    label: string,
    optional = false,
  ) => (
    <Field name={field} label={label + (optional ? " (optional)" : "")}>
      <input
        value={draft[field]}
        onChange={(event) => update(field, event.target.value)}
        maxLength={field === "year" ? 4 : field === "rate" ? 16 : 120}
        inputMode={
          ["year", "passengers", "cargoKg", "rate"].includes(field)
            ? "numeric"
            : "text"
        }
      />
    </Field>
  );
  if (step === 0)
    return (
      <>
        <Field name="type" label="Listing type">
          <select
            value={draft.type}
            onChange={(event) => update("type", event.target.value)}
          >
            <option value="">Choose a listing type</option>
            {listingTypes.map(([type, label]) => (
              <option value={type} key={type}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <p className="muted">
          Prepare one offering per application. Changing the type clears
          offering details and selected photos; business and contact details
          remain.
        </p>
        <p className="muted">
          Bike operators apply as providers here. Customers request pickups
          through the separate ride page. An application does not make an
          operator eligible for dispatch.
        </p>
      </>
    );
  if (step === 1)
    return (
      <div className="application-form-grid">
        <Field name="businessType" label="Business/operator type">
          <select
            value={draft.businessType}
            onChange={(event) => update("businessType", event.target.value)}
          >
            <option value="">Choose a provider type</option>
            <option value="company">Company or business</option>
            <option value="individual">Individual operator</option>
          </select>
        </Field>
        {input("name", "Business or operator name")}
        {input("location", "Base location")}
        <Field
          name="areas"
          label="Service areas"
          hint="Separate towns or districts with commas."
        >
          <input
            value={draft.areas}
            onChange={(event) => update("areas", event.target.value)}
            maxLength={500}
          />
        </Field>
        <div className="application-wide">
          <Field name="description" label="Business/operator description">
            <textarea
              value={draft.description}
              onChange={(event) => update("description", event.target.value)}
              minLength={10}
              maxLength={2000}
            />
          </Field>
        </div>
      </div>
    );
  if (step === 2)
    return (
      <div className="application-form-grid">
        {input(
          "title",
          draft.type === "logistics"
            ? "Transport service title"
            : draft.type === "bike-operator"
              ? "Motorcycle offering title"
              : "Vehicle or equipment title",
        )}
        <Field name="category" label="Offering category">
          <select
            value={draft.category}
            onChange={(event) => update("category", event.target.value)}
          >
            <option value="">Choose a category</option>
            {offeringCategories(draft.type).map(([category, label]) => (
              <option key={category} value={category}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        {draft.type !== "logistics" && (
          <>
            {input(
              "make",
              draft.type === "heavy-duty"
                ? "Equipment or vehicle make"
                : "Vehicle make",
            )}
            {input("model", "Model")}
            {input("year", "Year", true)}
            {["hire", "commercial", "bike-operator", "taxi-operator"].includes(
              draft.type,
            ) &&
              input(
                "passengers",
                "Passenger capacity",
                draft.type === "commercial",
              )}
            {(draft.type === "heavy-duty" || draft.type === "commercial") &&
              input("cargoKg", "Load capacity (kg)", true)}
            {draft.type === "heavy-duty" && (
              <Field name="operator" label="Operator inclusion">
                <select
                  value={draft.operator}
                  onChange={(event) => update("operator", event.target.value)}
                >
                  <option value="">Choose an option</option>
                  <option value="included">Operator included</option>
                  <option value="not-included">Operator not included</option>
                  <option value="confirm">To be confirmed with customer</option>
                </select>
              </Field>
            )}
          </>
        )}
        <div className="application-wide">
          <Field
            name="terms"
            label={
              draft.type === "logistics"
                ? "Cargo types and service details"
                : draft.type === "bike-operator"
                  ? "Motorcycle and service details"
                  : "Hire or transport terms"
            }
          >
            <textarea
              value={draft.terms}
              onChange={(event) => update("terms", event.target.value)}
              minLength={10}
              maxLength={2000}
            />
          </Field>
        </div>
        {draft.type !== "bike-operator" && (
          <>
            {input("rate", "Advertised rate (MWK)", true)}
            <Field name="unit" label="Rate unit">
              <select
                value={draft.unit}
                onChange={(event) => update("unit", event.target.value)}
              >
                <option value="day">Per day</option>
                <option value="week">Per week</option>
                <option value="month">Per month</option>
                <option value="trip">Per trip</option>
              </select>
            </Field>
            <p className="field-hint application-wide">
              Advertised rates are optional, separate from monthly listing fees
              and not a confirmed booking price.
            </p>
          </>
        )}
        {draft.type === "bike-operator" && (
          <p className="field-hint application-wide">
            No fares or rider assignment are set through this application.
            Future pickup quotes are coordinated by staff.
          </p>
        )}
      </div>
    );
  return (
    <div className="application-form-grid">
      <Field name="contactName" label="Contact name">
        <input
          value={draft.contactName}
          onChange={(event) => update("contactName", event.target.value)}
          autoComplete="name"
          maxLength={120}
        />
      </Field>
      <Field name="phone" label="Contact phone">
        <input
          type="tel"
          value={draft.phone}
          onChange={(event) => update("phone", event.target.value)}
          autoComplete="tel"
          maxLength={30}
        />
      </Field>
      <div className="application-wide">
        <Field name="email" label="Contact email">
          <input
            type="email"
            value={draft.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            maxLength={254}
          />
        </Field>
      </div>
    </div>
  );
}
