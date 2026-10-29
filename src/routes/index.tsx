import { ListingCallout } from "../components/listing-callout";
import { createFileRoute } from "@tanstack/react-router";
import { paths } from "../lib/categories";
import { MarketplaceHero } from "../components/marketplace-hero";
export const Route = createFileRoute("/")({ component: Home });
function Home() {
  return (
    <>
      <MarketplaceHero
        title="The right transport. For every journey."
        description="Explore vehicle hire, heavy-duty equipment and transport across Malawi. Start with what you need to move."
      >
        <a className="button" href="/hire">
          Explore vehicle hire →
        </a>
      </MarketplaceHero>
      <section className="wrap section">
        <div className="section-heading">
          <div>
            <h2>What are you moving?</h2>
            <p className="muted">Choose a journey, then explore the details.</p>
          </div>
        </div>
        <div className="journey-grid">
          {Object.entries(paths).map(([kind, path]) => (
            <article className="journey-card" key={kind}>
              <span className="eyebrow">GRANDLINE MOBILITY</span>
              <h3>{path.title}</h3>
              <p>{path.description}</p>
              <a className="button secondary" href={`/${kind}`}>
                Explore {path.title.toLowerCase()} →
              </a>
            </article>
          ))}
          <article className="journey-card">
            <span className="eyebrow">LOCAL JOURNEYS</span>
            <h3>Bike pickups</h3>
            <p>
              Plan a pickup with a staff-coordinated rider and a fare agreed
              before assignment.
            </p>
            <a className="button secondary" href="/bike-pickup">
              Explore bike pickups →
            </a>
          </article>
        </div>
      </section>
      <section className="wrap help-band">
        <div>
          <h2>Plan the journey. Know the details.</h2>
          <p className="muted">
            Compare supplied capacity, location, hire terms and operator
            information when listings become available.
          </p>
        </div>
        <div>
          <h3>Directory coming soon</h3>
          <p className="muted">
            Listings and online requests are not available yet. No booking,
            dispatch or payment is taken here.
          </p>
        </div>
        <ListingCallout />
      </section>
    </>
  );
}
