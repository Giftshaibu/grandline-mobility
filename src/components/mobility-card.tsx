import type { Entry } from "../lib/contracts";
export function MobilityCard({ entry }: { entry: Entry }) {
  return (
    <article className="entry-card">
      {entry.images[0] && (
        <img src={entry.images[0]} alt={entry.title} loading="lazy" />
      )}
      <div className="card-body">
        <h3>
          <a href={`/${entry.kind}/${encodeURIComponent(entry.slug)}`}>
            {entry.title}
          </a>
        </h3>
        <p>
          {entry.location} · {entry.provider.name}
        </p>
        {entry.price && (
          <p>
            MK{entry.price.amount.toLocaleString("en-MW")} / {entry.price.unit}
          </p>
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
      </div>
    </article>
  );
}
