import { sampleDetail } from "../lib/sample-catalogue";
import { SampleNotice } from "./sample-notice";
import { useQuery } from "@tanstack/react-query";
import { directory, type Kind } from "../lib/directory";
import { paths } from "../lib/categories";
import { Availability } from "./availability";
import { Enquiry } from "./enquiry";
export function MobilityDetail({ kind, slug }: { kind: Kind; slug: string }) {
  const query = useQuery({
    enabled: directory.supported,
    ...(!directory.supported
      ? {
          initialData: { state: "unavailable" } as Awaited<
            ReturnType<typeof directory.detail>
          >,
        }
      : {}),
    queryKey: ["mobility", kind, slug],
    queryFn: ({ signal }) => directory.detail(slug, kind, signal),
    retry: false,
  });
  const sample = !directory.supported ? sampleDetail(slug, kind) : undefined;
  const result = sample
    ? { state: "ready" as const, data: sample }
    : query.data;
  const entry = result?.state === "ready" ? result.data : undefined;
  return (
    <section className="wrap section">
      {sample && <SampleNotice />}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/">Mobility</a>
        <span>/</span>
        <a href={`/${kind}`}>{paths[kind].title}</a>
      </nav>
      {entry && entry.kind === kind ? (
        <div className="detail-layout">
          <article>
            <h1 className="directory-title">{entry.title}</h1>
            <p>{entry.location}</p>
            {entry.images[0] && (
              <img
                className="detail-image"
                src={entry.images[0]}
                alt={entry.title}
              />
            )}
            <p>{entry.description}</p>
            <dl className="facts">
              {entry.make && (
                <>
                  <dt>Make</dt>
                  <dd>{entry.make}</dd>
                </>
              )}
              {entry.model && (
                <>
                  <dt>Model</dt>
                  <dd>{entry.model}</dd>
                </>
              )}
              {entry.year && (
                <>
                  <dt>Year</dt>
                  <dd>{entry.year}</dd>
                </>
              )}
              {entry.price && (
                <>
                  <dt>Price</dt>
                  <dd>
                    MK{entry.price.amount.toLocaleString("en-MW")} /{" "}
                    {entry.price.unit}
                  </dd>
                </>
              )}
              {(entry.kind === "hire" ||
                entry.kind === "commercial" ||
                entry.kind === "bike-operator" ||
                entry.kind === "taxi-operator") &&
                entry.passengerCapacity && (
                  <>
                    <dt>Passengers</dt>
                    <dd>{entry.passengerCapacity}</dd>
                  </>
                )}
              {(entry.kind === "commercial" || entry.kind === "heavy-duty") &&
                entry.cargoCapacityKg !== undefined && (
                  <>
                    <dt>Cargo capacity</dt>
                    <dd>{entry.cargoCapacityKg.toLocaleString()} kg</dd>
                  </>
                )}
              {entry.kind === "hire" && entry.transmission && (
                <>
                  <dt>Transmission</dt>
                  <dd>{entry.transmission}</dd>
                </>
              )}
              {entry.kind === "logistics" && (
                <>
                  <dt>Service areas</dt>
                  <dd>{entry.serviceAreas.join(", ")}</dd>
                </>
              )}
            </dl>
            {entry.kind === "heavy-duty" && (
              <dl className="facts">
                {entry.vehicleType && (
                  <>
                    <dt>Vehicle type</dt>
                    <dd>{entry.vehicleType}</dd>
                  </>
                )}
                {entry.operatorIncluded !== undefined && (
                  <>
                    <dt>Operator</dt>
                    <dd>
                      {entry.operatorIncluded ? "Included" : "Not included"}
                    </dd>
                  </>
                )}
              </dl>
            )}
            {entry.terms && (
              <>
                <h2>Terms</h2>
                <p>{entry.terms}</p>
              </>
            )}
            <h2>{entry.provider.name}</h2>
            <p>{entry.provider.description}</p>
            <div className="contact-links">
              {entry.provider.contact.phone && (
                <a href={`tel:${entry.provider.contact.phone}`}>
                  Call provider
                </a>
              )}
              {entry.provider.contact.whatsapp && (
                <a
                  href={`https://wa.me/${entry.provider.contact.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              )}
            </div>
          </article>
          <Enquiry listingId={sample ? undefined : entry?.id} />
        </div>
      ) : (
        <>
          <h1 className="directory-title">Transport details</h1>
          <Availability
            result={
              entry
                ? { state: "error", reason: "invalid-response" }
                : query.isError
                  ? { state: "error", reason: "network" }
                  : result
            }
            pending={query.isPending}
            retry={() => {
              void query.refetch();
            }}
          />
          <Enquiry listingId={sample ? undefined : entry?.id} />
        </>
      )}
    </section>
  );
}
