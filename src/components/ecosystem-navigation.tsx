import { ecosystem } from "../lib/config";
import { productName } from "../lib/marketplace";
const information = {
  "Auto Hub": {
    description:
      "Browse vehicles for sale and spare parts, compare listings and contact sellers.",
    shortcut: "/parts",
    shortcutLabel: "Browse spare parts",
  },
  Services: {
    description:
      "Explore automotive shops and service providers, from maintenance to specialist repairs.",
    shortcut: "/shops",
    shortcutLabel: "Browse shops",
  },
  Mobility: {
    description:
      "Explore vehicle hire, heavy-duty transport and logistics, or plan a bike or taxi journey.",
    shortcut: "/ride",
    shortcutLabel: "Plan a ride",
  },
};
export function EcosystemNavigation() {
  return (
    <nav className="wrap ecosystem-switcher" aria-label="Grandline sites">
      <span className="ecosystem-switcher-label">Explore Grandline</span>
      {ecosystem
        .filter((site) => site.url)
        .map((site) =>
          site.label === productName ? (
            <span
              key={site.label}
              className="ecosystem-current"
              aria-current="page"
            >
              {site.label}
            </span>
          ) : (
            <a key={site.label} href={site.url}>
              {site.label} <span aria-hidden="true">↗</span>
            </a>
          ),
        )}
    </nav>
  );
}
export function EcosystemDiscovery() {
  const sites = ecosystem.filter(
    (site) => site.label !== productName && site.url,
  );
  if (!sites.length) return null;
  return (
    <section
      className="wrap section ecosystem-discovery"
      aria-labelledby="grandline-sites-title"
    >
      <h2 id="grandline-sites-title">More from Grandline</h2>
      <p className="muted">
        Looking for something else? Explore the other Grandline sites.
      </p>
      <div className="ecosystem-discovery-grid">
        {sites.map((site) => {
          const detail = information[site.label as keyof typeof information];
          if (!detail || !site.url) return null;
          return (
            <article key={site.label}>
              <h3>Grandline {site.label}</h3>
              <p className="muted">{detail.description}</p>
              <div className="ecosystem-discovery-actions">
                <a className="button" href={site.url}>
                  Visit {site.label} <span aria-hidden="true">↗</span>
                </a>
                <a href={new URL(detail.shortcut, site.url).toString()}>
                  {detail.shortcutLabel} <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
