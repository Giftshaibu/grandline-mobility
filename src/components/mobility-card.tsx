import { CatalogueCardFrame, CatalogueImage, CatalogueCardBody, CatalogueTitle, CataloguePrice } from "@grandline/ui";
import type { Entry } from "../lib/contracts";
export function MobilityCard({ entry }: { entry: Entry }) {
  return (
    <CatalogueCardFrame className="entry-card">
      <CatalogueImage src={entry.images[0]} alt={entry.title} />
      <CatalogueCardBody>
        {entry.reviewStatus === "pending" && <p className="grandline-public-review">Pending review</p>}
        <CatalogueTitle>
          <a href={`/${entry.kind}/${encodeURIComponent(entry.slug)}`}>
            {entry.title}
          </a>
        </CatalogueTitle>
        <p className="grandline-card-meta">
          {entry.location} · {entry.provider.name}
        </p>
        {entry.price && (
          <div className="grandline-card-price-row"><CataloguePrice>MWK {entry.price.amount.toLocaleString("en-MW")} / {entry.price.unit}</CataloguePrice></div>
        )}
        {(entry.kind === "hire" ||
          entry.kind === "bike-operator" ||
          entry.kind === "taxi-operator") &&
          entry.passengerCapacity && (
            <p>{entry.passengerCapacity} passengers</p>
          )}
        {(entry.kind === "commercial" || entry.kind === "heavy-duty") &&
          entry.cargoCapacityKg !== undefined && (
            <p>{entry.cargoCapacityKg.toLocaleString()} kg carrying capacity</p>
          )}
        {entry.kind === "logistics" && <p>{entry.serviceAreas.join(" · ")}</p>}
        <a
          className="button secondary"
          href={`/${entry.kind}/${encodeURIComponent(entry.slug)}`}
        >
          View details
        </a>
      </CatalogueCardBody>
    </CatalogueCardFrame>
  );
}
