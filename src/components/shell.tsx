import { Link } from "@tanstack/react-router";
import { ecosystem } from "../lib/config";
import { AccountControl } from "./auth";
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#main-content">
        Skip to content
      </a>
      <div className="topline">The Grandline ecosystem · Malawi</div>
      <header className="site-header wrap">
        <a href="/" aria-label="grandlineauto mobility home">
          <img className="brand" src="/logo-full.svg" alt="grandlineauto" />
          <span className="product-name">Mobility</span>
        </a>
        <AccountControl />
      </header>
      <nav className="product-nav wrap" aria-label="Main navigation"><Link to="/">Overview</Link></nav>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer>
        <div className="wrap footer-inner">
          <div>
            <img
              className="brand"
              src="/logo-light-full.svg"
              alt="grandlineauto"
            />
            <p>Transport for the journey ahead.</p>
          </div>
          <nav aria-label="Grandline ecosystem">
            {ecosystem
              .filter((item) => item.url)
              .map((item) => (
                <a key={item.label} href={item.url}>
                  {item.label} ↗
                </a>
              ))}
          </nav>
          <p className="muted">Grandline Mobility · Malawi</p>
        </div>
      </footer>
    </>
  );
}
