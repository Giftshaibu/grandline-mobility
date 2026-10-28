import { useState } from "react";
import type { DirectorySearch } from "../lib/contracts";
import type { Kind } from "../lib/directory";
import { sampleResults } from "../lib/sample-catalogue";
import { SampleNotice } from "./sample-notice";
export function SampleCatalogue({
  search,
  kind,
}: {
  search: DirectorySearch;
  kind: Kind;
}) {
  const [sort, setSort] = useState("name");
  const entries = [...sampleResults(search, kind)].sort((a, b) =>
    sort === "location"
      ? a.location.localeCompare(b.location)
      : a.title.localeCompare(b.title),
  );
  return (
    <section aria-label="Sample catalogue">
      <SampleNotice />
      <div className="catalogue-toolbar">
        <p>{entries.length} sample listings · not live inventory</p>
        <label>
          Sort sample listings
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="name">Name</option>
            <option value="location">Location</option>
          </select>
        </label>
      </div>
      {entries.length ? (
        <div className="cards">
          {entries.map((entry) => (
            <article key={entry.slug} className="entry-card sample-card">
              <a
                href={`/${entry.kind}/${entry.slug}`}
                className="sample-media"
                aria-label={`View ${entry.title}`}
              >
                <img src={entry.images[0]} alt="" loading="lazy" />
                <span>Illustrative photo</span>
              </a>
              <div className="card-body">
                <span className="sample-label">Sample listing</span>
                <h3>
                  <a href={`/${entry.kind}/${entry.slug}`}>{entry.title}</a>
                </h3>
                <p>
                  {entry.location} · {entry.category.replaceAll("-", " ")}
                </p>
                {entry.kind !== "logistics" && entry.price ? (
                  <p className="sample-price">
                    Example MK{entry.price.amount.toLocaleString("en-MW")} /{" "}
                    {entry.price.unit}
                  </p>
                ) : (
                  <p className="sample-price">Example profile</p>
                )}
                <p className="muted sample-description">
                  {entry.kind === "hire"
                    ? `${entry.passengerCapacity} passengers · hire details`
                    : entry.kind === "heavy-duty"
                      ? "Equipment, capacity and operator details"
                      : entry.kind === "commercial"
                        ? "Commercial vehicle and provider details"
                        : "Goods and vehicle movement details"}
                </p>
                <a
                  className="button secondary"
                  href={`/${entry.kind}/${entry.slug}`}
                >
                  View sample details →
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="catalogue-empty">
          <h2>No sample listings match these filters.</h2>
          <p>
            Try another category or location. This does not reflect real
            inventory.
          </p>
          <a href={`/${kind}`}>Clear sample filters</a>
        </div>
      )}
    </section>
  );
}
