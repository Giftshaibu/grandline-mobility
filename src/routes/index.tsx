import { createFileRoute, Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/ArrowUpRight01Icon";
import { paths } from "../lib/categories";
export const Route = createFileRoute("/")({ component: Home });
function Home() {
  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div>
            <p className="product-label">Grandline Mobility</p>
            <h1>
              People. Goods.
              <br />
              On the move.
            </h1>
            <p>
              Find your way to vehicle hire, commercial transport and logistics
              across Malawi.
            </p>
          </div>
          <div className="hero-aside">
            <h2>
              Different journeys.
              <br />
              The right transport.
            </h2>
            <p>
              From a car for the weekend to moving business stock, start with
              the transport you need.
            </p>
          </div>
        </div>
      </section>
      <section className="wrap section">
        <div className="section-heading">
          <div>
            <h2>What are you moving?</h2>
            <p className="muted">Choose a transport category to begin.</p>
          </div>
        </div>
        <div className="mobility-paths">
          {(Object.keys(paths) as (keyof typeof paths)[]).map((kind) => (
            <article key={kind} className="mobility-path">
              <HugeiconsIcon
                icon={ArrowUpRight01Icon}
                size={30}
                color="var(--brand)"
              />
              <h3>{paths[kind].title}</h3>
              <p className="muted">{paths[kind].description}</p>
              <Link className="button secondary" to={`/${kind}`}>
                Explore {paths[kind].title.toLowerCase()} →
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="wrap help-band">
        <div>
          <h2>
            Plan the journey.
            <br />
            Speak to the provider.
          </h2>
          <p className="muted">
            Compare relevant details and contact providers when the directory
            opens.
          </p>
        </div>
        <div>
          <span className="status-tag">Directory coming soon</span>
          <h3>We’re preparing the network.</h3>
          <p className="muted">
            Listings and enquiries aren’t available yet. Prices, capacity and
            terms will appear only when supplied by actual providers.
          </p>
        </div>
      </section>
    </>
  );
}
